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

export function getMinDueDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getInitials(name: string) {
  const normalizedName = name.trim();
  const hash = normalizedName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = `hsl(${hash % 360}, 70%, 45%)`;

  return {
    initials: normalizedName.split(" ")[0][0]?.toUpperCase() ?? "",
    color,
  };
}
