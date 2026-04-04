import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function calculateDepreciation(
  cost: number,
  purchaseDate: Date,
  rate: number = 25
): number {
  const years =
    (Date.now() - new Date(purchaseDate).getTime()) / (365.25 * 24 * 3600000);
  const bookValue = cost * Math.pow(1 - rate / 100, years);
  return Math.max(0, Math.round(bookValue));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const COMPANIES = [
  { value: "NCPL", label: "NCPL" },
  { value: "NIPL", label: "NIPL" },
  { value: "NRPL", label: "NRPL" },
  { value: "RAINLAND_AUTO_CORP", label: "Rainland Auto Corp" },
  { value: "ISKY", label: "ISKY" },
  { value: "OTHER", label: "Other" },
] as const;

export const DEPARTMENTS = [
  "IT",
  "HR",
  "Finance",
  "Operations",
  "Sales",
  "Marketing",
  "Admin",
  "Management",
  "Legal",
  "Engineering",
] as const;

export const LOCATIONS = [
  "Bangalore",
  "Ankola",
  "Chickmagalur",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Hyderabad",
] as const;

export const ASSET_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "SPARE", label: "Spare", color: "bg-blue-100 text-blue-800" },
  { value: "REPAIR", label: "Repair", color: "bg-yellow-100 text-yellow-800" },
  { value: "SCRAP", label: "Scrap", color: "bg-red-100 text-red-800" },
  { value: "TRANSFERRED", label: "Transferred", color: "bg-purple-100 text-purple-800" },
] as const;
