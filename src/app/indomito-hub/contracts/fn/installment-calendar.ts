import { CONTRACT_MONTHS } from '../constants/contract-options';

/** Normaliza meses históricos sin inferir un año o un día faltante. */
export function installmentMonthNumber(value: string | null | undefined): number {
  const month = Number(value);
  if (Number.isInteger(month) && month >= 1 && month <= 12) return month;
  return CONTRACT_MONTHS.findIndex(({ label }) => label.toLowerCase() === value?.toLowerCase()) + 1;
}

/** Días seleccionables según el calendario civil, incluidos años bisiestos. */
export function installmentDayOptions(
  year: number | null | undefined,
  monthValue: string | null | undefined,
): number[] {
  const month = installmentMonthNumber(monthValue);
  if (!Number.isInteger(year) || !year || year < 2000 || year > 2200 || !month) return [];
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => index + 1);
}
