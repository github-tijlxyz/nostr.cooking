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
      const a = nip19.decode($page.params.slug);
      if (!(a.type == 'naddr')) {
        throw new Error();
      }
      const b = a.data;
      naddr = nip19.naddrEncode({
        identifier: b.identifier,
        pubkey: b.pubkey,
        kind: 30023
      });
      let e = await $ndk.fetchEvent({
        '#d': [b.identifier],
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
        const id = e.tags.find((z) => z[0] == 'd')?.[1];
        if (!id || !e.kind) {
          throw new Error();
        }
        naddr = nip19.naddrEncode({
          identifier: id,
          kind: e.kind,
          pubkey: e.author.pubkey
        });
        const c = nip19.naddrEncode({
          identifier: id,
          kind: e.kind,
          pubkey: e.author.pubkey
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
