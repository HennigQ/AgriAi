import md5 from 'md5';
import { URLSearchParams } from 'url';

export type PayfastFields = Record<string, string | number | undefined | null>;

export function generateSignature(fields: PayfastFields) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const entries = Object.entries(fields)
    .filter(([k, v]) => k !== 'signature' && v !== undefined && v !== null && String(v) !== '')
    .sort(([a],[b]) => a.localeCompare(b));

  const params = new URLSearchParams();
  for (const [k, v] of entries) params.append(k, String(v));
  let str = params.toString();
  if (passphrase) str += `&passphrase=${encodeURIComponent(passphrase)}`;
  return md5(str);
}

export function validateSignature(itn: PayfastFields) {
  const received = String(itn.signature || '');
  const calc = generateSignature(itn);
  return received === calc;
}