import dayjs from "dayjs";

export function formatDate(date: string | null | undefined): string {
  return date ? dayjs(date).format("DD/MM/YYYY") : "—";
}

export function formatDateTime(date: string | null | undefined): string {
  return date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—";
}

export function calculateAge(date: string | null | undefined): number | null {
  return date ? dayjs().diff(dayjs(date), "year") : null;
}
