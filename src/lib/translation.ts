import { setCORS } from 'google-translate-api-browser';

const gTranslate = setCORS('https://cors-anywhere.herokuapp.com/');

export async function translate(language: string, string: string) {
  // @ts-ignore
  const e = await gTranslate(string, { to: language });
  return e;
}
