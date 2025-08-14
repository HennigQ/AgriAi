export type PricePoint = { date: string; price_per_kg: number };

export function forecastPrices(history: PricePoint[], daysAhead = 30): PricePoint[] {
  if (!history.length) return [];

  const series = [...history].sort((a,b)=>a.date.localeCompare(b.date));

  const n = series.length;
  const xs = series.map((_, i) => i + 1);
  const ys = series.map(p => p.price_per_kg);
  const sumX = xs.reduce((a,b)=>a+b,0);
  const sumY = ys.reduce((a,b)=>a+b,0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX || 1);
  const intercept = (sumY - slope*sumX) / n;

  const byMonth: Record<number, number[]> = {};
  for (const p of series) {
    const m = new Date(p.date + 'T00:00:00Z').getUTCMonth() + 1;
    (byMonth[m] ||= []).push(p.price_per_kg);
  }
  const monthAvg: Record<number, number> = {};
  for (let m=1;m<=12;m++) {
    const arr = byMonth[m] || [];
    monthAvg[m] = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  }
  const globalMean = ys.reduce((a,b)=>a+b,0)/n;
  const seasonalIndex: Record<number, number> = {};
  for (let m=1;m<=12;m++) {
    const ma = monthAvg[m];
    seasonalIndex[m] = ma ? ma / globalMean : 1.0;
  }

  const lastDate = new Date(series[series.length-1].date + 'T00:00:00Z');
  const out: PricePoint[] = [];
  for (let i=1;i<=daysAhead;i++) {
    const d = new Date(lastDate);
    d.setUTCDate(d.getUTCDate()+i);
    const idx = n + i;
    const base = intercept + slope*idx;
    const m = d.getUTCMonth()+1;
    const seasonal = seasonalIndex[m] || 1.0;
    const yhat = Math.max(0, base * seasonal);
    out.push({ date: d.toISOString().slice(0,10), price_per_kg: Number(yhat.toFixed(2)) });
  }
  return out;
}