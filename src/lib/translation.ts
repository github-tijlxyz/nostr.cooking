import { setCORS } from 'google-translate-api-browser';

const gTranslate = setCORS('https://corsproxy.io/?');

export async function translate(language: string, string: string) {
  // @ts-ignore
  const e = await gTranslate(string, { to: language });
  return e;
}
