<script lang="ts">
  import { page } from '$app/stores';
  import { ndk, userPublickey, relays } from '$lib/nostr';
  import { parseMarkdown } from '$lib/pharser';
  import { formatDate } from '$lib/utils';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { requestProvider } from 'webln';
  import ZapModal from '../../../components/ZapModal.svelte';
  import { nip19 } from 'nostr-tools';
  import { translate } from '$lib/translation';
  import { translateOption } from '$lib/state';
  import TotalZaps from '../../../components/Recipe/TotalZaps.svelte';
  import { goto } from '$app/navigation';
  import TagLinks from '../../../components/Recipe/TagLinks.svelte';
  import 'zapthreads';
  import ExtraMenu from '../../../components/ExtraMenu.svelte';
  import Recipe from '../../../components/Recipe/Recipe.svelte';
  import Comments from '../../../components/Comments.svelte';

  let event: NDKEvent;
  let zapModal = false;
  let naddr: string = '';
  let menu = false;
  let copied = false;

  async function copyNpub() {
    copied = true;
    const type = 'text/plain';
    const blob = new Blob([event.author.npub], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(data).then(() => {
      setTimeout(() => {
        copied = false;
      }, 2500);
    });
  }

  // for zapthreads
  let key = '';
  let sk = localStorage.getItem('nostrcooking_privateKey');
  if (sk) {
    key = nip19.nsecEncode(sk);
  } else if ($userPublickey) {
    key = nip19.npubEncode($userPublickey);
  }

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  async function copyNaddr() {
    const type = 'text/plain';
    const blob = new Blob([naddr], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(data).then(() => {
      setTimeout(() => {}, 2500);
    });
  }

  async function closeMenu() {
    setTimeout(() => {
      menu = false;
    }, 1);
    // setTimeout(() => {
    //   menu = true;
    // }, 7)
    // setTimeout(() => {
    //   menu = false;
    // }, 8)
  }

  async function zapEvt(amount: number, message: string) {
    zapModal = false;
    if (amount) {
      const a = await event.zap(amount * 1000, message);
      if (a) {
        try {
          const webln = await requestProvider();
          const res = await webln.sendPayment(a);
        } catch (err) {
          console.log('error while handleing zap', err);
        }
      }
    }
  }

  async function loadData() {
    if ($page.params.slug.startsWith('naddr1')) {
      const b = nip19.decode($page.params.slug).data;
      naddr = nip19.naddrEncode({
        // @ts-ignore
        identifier: b.identifier,
        // @ts-ignore
        pubkey: b.pubkey,
        kind: 30023
      });
      let e = await $ndk.fetchEvent({
        // @ts-ignore
        '#d': [b.identifier],
        // @ts-ignore
        authors: [b.pubkey],
        kinds: [30023]
      });
      if (e) {
        event = e;
      }
    } else {
      let e = await $ndk.fetchEvent($page.params.slug);
      if (e) {
        event = e;
        naddr = nip19.naddrEncode({
          // @ts-ignore
          identifier: e.tags.find((z) => z[0] == 'd')?.[1],
          // @ts-ignore
          kind: e.kind,
          pubkey: e.author.hexpubkey
        });
        const c = nip19.naddrEncode({
          // @ts-ignore
          identifier: e.tags.find((z) => z[0] == 'd')?.[1],
          // @ts-ignore
          kind: e.kind,
          pubkey: e.author.hexpubkey
        });
        goto(`/recipe/${c}`);
      }
    }
  }
</script>

<svelte:head>
  <title
    >{event
      ? event.tags.find((e) => e[0] == 'title')?.[1]
        ? event.tags.find((e) => e[0] == 'title')?.[1]
        : event.tags.find((e) => e[0] == 'd')?.[1]
      : '...'} on nostr.cooking</title
  >
</svelte:head>

{#if event}
  <Recipe event={event} />
{/if}
