import { clsx, type ClassValue } from "clsx";
import { randomInt } from "node:crypto";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildProjectCode() {
  const digits = randomInt(100, 1000);
  const suffix = String.fromCharCode(65 + randomInt(0, 26));
  return `PROJ-${digits}${suffix}`;
}

export function isExpired(date: Date) {
  const dueDate = new Date(date);
  dueDate.setUTCHours(23, 59, 59, 999);

  return dueDate.getTime() < new Date().getTime();
}
