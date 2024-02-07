<script lang="ts">
  import { ndk } from '$lib/nostr';
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import TagsSearchAutocomplete from '../../components/TagsSearchAutocomplete.svelte';
  import { goto } from '$app/navigation';

  let events: NDKEvent[] = [];

  function openTag(query: string) {
    if(query.startsWith('npub')) {
      goto(`/user/${query}`);
    } else if(query.startsWith('naddr')) {
      goto(`/recipe/${query}`);
    } else {
      goto(`/tag/${query}`)
    }
  }

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
  <title>recent recipes on nostr.cooking</title>
</svelte:head>

<TagsSearchAutocomplete
  placeholderString={"Look for a specific tag, like 'italian', 'steak' or 'glutenfree', or search by npub."}
  actionString={'Go'}
  action={openTag}
/>

<div class="mb-4 mt-0">
  <a
    href="/tags"
    class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-black bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 w-full"
  >
    <div class="w-full text-center">Explore all tags</div>
  </a>
</div>


<div class="flex flex-col gap-2">
  <div class="prose">
    <h2>Recent Recipes</h2>
  </div>
  <div>
    {#if events.length > 0}
      <Feed {events} hideHide={true} />
    {:else}
      <div class="grid gap-x-4 gap-y-10 grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
        {#each new Array(24) as i}
          <div class="flex flex-col gap-4">
            <div
              class="rounded-3xl w-[160px] h-[237px] cursor-pointer transition relative overflow-hidden bg-slate-200 animate-pulse"
            >
            </div>

            <h5 class="text-md leading-tight text-wrap text-slate-200 bg-slate-200 animate-pulse">
              PLACEHOLDER RECIPE {i}
            </h5>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
