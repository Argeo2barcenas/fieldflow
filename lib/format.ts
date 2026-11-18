import { APP_TIME_ZONE } from "@/lib/datetime";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(value: number): string {
  return currency.format(value);
}

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
