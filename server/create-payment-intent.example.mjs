#!/usr/bin/env node
/**
 * NEXORA — serveur de paiement de référence (Stripe PaymentIntents)
 * ================================================================
 *
 * CE FICHIER N'EST JAMAIS EXÉCUTÉ PAR LE SITE. Il documente l'implémentation
 * serveur qui fait passer le checkout du mode démonstration au mode paiement
 * réel. Aucune dépendance du projet n'est requise pour builder le front.
 *
 *   npm i express stripe
 *   STRIPE_SECRET_KEY=sk_test_… node server/create-payment-intent.example.mjs
 *
 * ── Règles non négociables ──────────────────────────────────────────────────
 *  1. `STRIPE_SECRET_KEY` ne quitte jamais le serveur : ni bundle, ni dépôt,
 *     ni réponse HTTP. Seule la clé PUBLIQUE (`pk_…`) atteint le navigateur.
 *  2. Le montant est recalculé ici à partir de `server/prices.json` (export des
 *     prix de `src/data/products.ts`, contrôle automatique via `npm run audit`).
 *     Le total envoyé par le navigateur n'est jamais considéré comme fiable.
 *  3. Le navigateur ne reçoit qu'un `clientSecret` — jamais de carte, jamais de
 *     cryptogramme : les champs bancaire vivent dans l'iframe de Stripe.
 *  4. La commande fait foi côté serveur, dans le webhook signé
 *     (`payment_intent.succeeded`), pas dans la redirection du navigateur.
 *
 * ── CSP ─────────────────────────────────────────────────────────────────────
 * Activer le mode Stripe impose d'autoriser Stripe dans les en-têtes :
 * voir README « Deployment security » et le bloc commenté de `public/_headers`.
 */

import express from 'express';
import Stripe from 'stripe';
import { readFileSync } from 'node:fs';

const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PORT = 4242 } = process.env;

if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY manquante — serveur de paiement non démarré.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

/** Prix en centimes, source de vérité côté serveur (contrôlée par `npm run audit`). */
const PRICES = JSON.parse(readFileSync(new URL('./prices.json', import.meta.url), 'utf8'));

/**
 * Règles commerciales — doit rester aligné sur
 * `src/context/StoreContext.tsx` (PROMO_CODES, FREE_SHIPPING_THRESHOLD,
 * SHIPPING_FLAT_RATE). En production, ces valeurs viennent de la base.
 */
const PROMO_CODES = { NEXORA10: 10, CYBERWEEK15: 15 };
const FREE_SHIPPING_THRESHOLD = 10000; // 100,00 € en centimes
const SHIPPING_FLAT_RATE = 490; // 4,90 € en centimes

const app = express();

/**
 * POST /api/create-payment-intent
 * Corps attendu : { currency, email, items: [{ id, quantity }], promo? }
 * Réponse     : { clientSecret }
 */
app.post('/api/create-payment-intent', express.json({ limit: '16kb' }), async (request, response) => {
  try {
    const { currency = 'eur', email, items, promo } = request.body ?? {};

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return response.status(400).json({ error: 'Panier invalide.' });
    }

    let subtotal = 0;
    const lineItems = [];
    for (const item of items) {
      const quantity = Number.parseInt(item?.quantity, 10);
      // `hasOwnProperty` : un id inconnu (y compris un nom hérité du prototype)
      // doit être rejeté plutôt que de résoudre un "prix" inattendu.
      const known = typeof item?.id === 'string' && Object.prototype.hasOwnProperty.call(PRICES, item.id);
      const unitPrice = known ? PRICES[item.id] : undefined;
      if (!unitPrice || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        return response.status(400).json({ error: 'Panier invalide.' });
      }
      subtotal += unitPrice * quantity;
      lineItems.push({ id: item.id, quantity, unitPrice });
    }

    const percent = typeof promo === 'string' ? (PROMO_CODES[promo] ?? 0) : 0;
    const discount = percent ? Math.round((subtotal * percent) / 100) : 0;
    const shipping =
      subtotal === 0 || subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
    const amount = Math.max(subtotal - discount + shipping, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: typeof currency === 'string' ? currency : 'eur',
      automatic_payment_methods: { enabled: true },
      ...(typeof email === 'string' && email.length <= 200 ? { receipt_email: email } : {}),
      metadata: {
        cart: JSON.stringify(lineItems).slice(0, 4000),
        promo: percent ? String(promo).slice(0, 40) : 'none',
      },
    });

    return response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // Jamais de détail interne (ni clé, ni stack) côté navigateur.
    console.error('[payment-intent]', error instanceof Error ? error.message : error);
    return response.status(500).json({ error: 'Paiement indisponible.' });
  }
});

/**
 * POST /webhook — source de vérité de la commande.
 * Le corps brut est requis par `constructEvent`.
 */
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    let event;
    try {
      if (!STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET absente');
      event = stripe.webhooks.constructEvent(
        request.body,
        request.headers['stripe-signature'],
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error('[webhook]', error instanceof Error ? error.message : error);
      return response.status(400).send('Signature invalide');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      // Créer la commande en base à partir de paymentIntent.metadata.cart.
      // C'est ce journal — et non la page de confirmation — qui fait foi.
      console.log(`Commande à enregistrer : ${paymentIntent.id}`);
    }

    return response.status(200).send('ok');
  },
);

app.listen(PORT, () => {
  console.log(`Serveur de paiement de référence sur http://localhost:${PORT}`);
});
