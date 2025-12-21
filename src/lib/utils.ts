import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const parseCurrency = (value: string) => {
  const cleaned = value.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
  const numberValue = Number(cleaned);
  return Number.isNaN(numberValue) ? 0 : numberValue;
};

export const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
