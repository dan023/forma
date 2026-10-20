/** Numeri nella lingua corrente (es. "1.240", "3,6"). */
export const formatNumber = (n: number, lang: string, maxDecimals = 1) =>
  n.toLocaleString(lang, { maximumFractionDigits: maxDecimals });
