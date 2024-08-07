<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import TagsSearchAutocomplete from '../../components/TagsSearchAutocomplete.svelte';
  import { goto } from '$app/navigation';
  import { Name } from '@nostr-dev-kit/ndk-svelte-components';
  import { recipeTags } from '$lib/consts';

  function isPopTag(tag: string): boolean {
    switch (tag.toLowerCase()) {
      case 'asian':
      case 'american':
      case 'quick':
      case 'easy':
      case 'beef':
      case 'chicken':
      case 'seafood':
      case 'italian':
      case 'mexican':
      case 'dessert':
      case 'breakfast':
      case 'alcohol':
        return true;
      default:
        return false;
    }
  }

  const popTags = recipeTags.filter((v) => isPopTag(v.title));

  let events: NDKEvent[] = [];

  onMount(async () => {
    let filter: NDKFilter = { limit: 256, kinds: [30023], '#t': ['nostrcooking'] };
    const evts = await $ndk.fetchEvents(filter);
    let evtsArr = Array.from(evts);
    evtsArr.forEach((ev, i) => {
      if (validateMarkdownTemplate(ev.content) == null) {
        evtsArr.splice(i, 1);
      }
    });
    events = evtsArr;
  });
</script>

<svelte:head>
  <title>Recent Recipes</title>
  <meta name="description" content="View Recent Recipes on Zap Cooking" />
  <meta property="og:url" content="https://zap.cooking/recent" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Recent Recipes" />
  <meta property="og:description" content="View Recent Recipes on Zap Cooking" />
  <meta property="og:image" content="https://zap.cooking/logo_with_text.png" />

  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content="zap.cooking" />
  <meta property="twitter:url" content="https://zap.cooking/recent" />
  <meta name="twitter:title" content="Recent Recipes" />
  <meta name="twitter:description" content="View Recent Recipes on Zap Cooking" />
  <meta property="twitter:image" content="https://zap.cooking/logo_with_text.png" />
</svelte:head>

<div class="flex flex-col gap-3 md:gap-10">
  <div class="hidden lg:flex w-screen gap-6 overflow-y-hidden overflow-x-auto">
    {#each popTags as tag}
      <a class="flex transition duration-300 hover:text-primary" href="/tag/{tag.title}">{tag.title}</a>
    {/each}
  </div>

  <div class="lg:hidden">
    <select class="w-full input" onchange="window.location.href=this.value">
      <option value="">All categories</option>
      {#each popTags as tag}
        <option value="/tag/{tag.title}">{tag.title}</option>
      {/each}
    </select>
  </div>

  <div class="flex flex-col gap-2">
    <h2>Recent Recipes</h2>
    <div><Feed {events} hideHide={true} /></div>
  </div>
</div>
