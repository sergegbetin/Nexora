import { useStore } from '../context/StoreContext';

/** Notification contextuelle (ajout panier, favoris, code promo…). */
export function Toast() {
  const { state, dispatch } = useStore();
  if (!state.toast) return null;

  return (
    <div className={`toast toast-${state.toast.type}`} role="status" aria-live="polite">
      <span aria-hidden="true">
        {state.toast.type === 'success' ? '✓' : state.toast.type === 'error' ? '!' : 'i'}
      </span>
      <p>{state.toast.message}</p>
      <button onClick={() => dispatch({ type: 'HIDE_TOAST' })} aria-label="Fermer la notification">
        ×
      </button>
    </div>
  );
}

export default Toast;
