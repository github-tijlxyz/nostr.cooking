import { setCORS as googletranslate } from 'google-translate-api-browser';
import type { TranslateOption } from './state';
//import { translate as libretranslate } from 'libretranslate';

export async function translate(translateOption: TranslateOption, string: string) {
  if (translateOption.option == 'google') {
    const gTranslate = googletranslate(translateOption.data);
    // @ts-expect-error not my code, eslint got mad :(
    const e = await gTranslate(string, { to: translateOption.lang });
    return e;
  }
  /*if (translateOption.option == 'libretranslate') {
    const e = await libretranslate({
        query: string,
        target: translateOption.lang,
        apiurl: translateOption.data,
    });
    return e;
  }*/

  return '';
}
