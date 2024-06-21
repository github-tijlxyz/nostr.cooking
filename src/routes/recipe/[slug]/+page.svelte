<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import Recipe from '../../../components/Recipe/Recipe.svelte';

  let event: NDKEvent | null = null;
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

  $: og_meta = {
    title: event
      ? event.tags.find((tag) => tag[0] === 'title')?.[1] || event.content.slice(0, 60) + '...'
      : 'Recipe on Zap Cooking',
    description: event ? event.content.slice(0, 200) + '...' : 'Click to view on Zap Cooking',
    image: event ? event.tags.find((tag) => tag[0] === 'image')?.[1] || '' : ''
  };
</script>

<svelte:head>
  <title
    >{event
      ? event.tags.find((e) => e[0] == 'title')?.[1]
        ? event.tags.find((e) => e[0] == 'title')?.[1]
        : event.tags.find((e) => e[0] == 'd')?.[1]
      : '...'} on zap.cooking</title
  >

  {#if event}
    <meta name="description" content={og_meta.description} />
    <meta property="og:url" content={`https://zap.cooking/recipe/${$page.params.slug}`} />
    <meta property="og:type" content="article" />
    <meta property="og:title" content={og_meta.title} />
    <meta property="og:description" content={og_meta.description} />
    <meta property="og:image" content={og_meta.image} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:domain" content="zap.cooking" />
    <meta property="twitter:url" content={`https://zap.cooking/recipe/${$page.params.slug}`} />
    <meta name="twitter:title" content={og_meta.title} />
    <meta name="twitter:description" content={og_meta.description} />
    <meta name="twitter:image" content={og_meta.image} />
  {/if}
</svelte:head>

{#if event}
  <Recipe {event} />
  {:else}
  <div class="flex justify-center items-center h-screen">
    <img class="w-64" src="/pan-animated.svg" alt="Loading" />
  </div>
{/if}
