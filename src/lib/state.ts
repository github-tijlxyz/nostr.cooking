import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

type TranslateOption = {
  option: string;
  lang: string;
};

let l;
if (browser) {
  l = localStorage.getItem('nostrcooking_translationOptions');
}
let to: TranslateOption | undefined;
if (l) {
  to = JSON.parse(l);
}

export const translateOption: Writable<TranslateOption> = writable(to || { option: '', lang: '' });
