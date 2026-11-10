import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatOvers(legalBalls: number): string {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

export function calculateRunRate(runs: number, legalBalls: number): number {
  if (legalBalls === 0) return 0;
  return parseFloat(((runs / legalBalls) * 6).toFixed(2));
}

export function calculateRequiredRunRate(runsNeeded: number, ballsRemaining: number): number {
  if (ballsRemaining <= 0) return runsNeeded > 0 ? 99.99 : 0;
  if (runsNeeded <= 0) return 0;
  return parseFloat(((runsNeeded / ballsRemaining) * 6).toFixed(2));
}

export function calculateEconomy(runsConceded: number, legalBalls: number): number {
  if (legalBalls === 0) return 0;
  return parseFloat(((runsConceded / legalBalls) * 6).toFixed(2));
}

export function calculateStrikeRate(runs: number, ballsFaced: number): number {
  if (ballsFaced === 0) return 0;
  return parseFloat(((runs / ballsFaced) * 100).toFixed(2));
}
