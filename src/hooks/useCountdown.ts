import { useEffect, useState } from 'react';

export interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  label: string;
  total: number;
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Compte à rebours pilote (données de démonstration).
 * La valeur initiale est modifiable ici sans toucher au reste du site.
 */
export const CAMPAIGN_SECONDS = 2 * 86400 + 14 * 3600 + 36 * 60 + 52;

export function useCountdown(initial: number = CAMPAIGN_SECONDS): Countdown {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(secs),
    label: `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(secs)}`,
    total: seconds,
  };
}
