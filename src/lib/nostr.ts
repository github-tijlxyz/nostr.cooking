import { browser } from '$app/environment';
import NDK from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { writable, type Writable } from 'svelte/store';
import { standardRelays } from './consts';

export const relays = JSON.parse(
	(browser && localStorage.getItem('nostrcooking_relays')) || JSON.stringify(standardRelays)
);

const dexieAdapter = new NDKCacheAdapterDexie({ dbName: 'nostrcooking-ndk-cache-db' });
const Ndk: NDK = new NDK({ explicitRelayUrls: relays, cacheAdapter: dexieAdapter });
browser && Ndk.connect().then(() => console.log('ndk connected'));

export const ndk: Writable<NDK> = writable(Ndk);

export const userPublickey: Writable<string> = writable(
	(browser && localStorage.getItem('nostrcooking_loggedInPublicKey')) || ''
);
