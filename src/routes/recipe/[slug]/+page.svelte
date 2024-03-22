<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import Recipe from '../../../components/Recipe/Recipe.svelte';

  let event: NDKEvent;
  let naddr: string = '';

  $: {
    if ($page.params.slug) {
      loadData();
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
  <Recipe {event} />
{/if}
