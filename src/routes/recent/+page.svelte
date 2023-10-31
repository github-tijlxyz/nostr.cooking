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
    goto(`/tag/${query}`);
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

<TagsSearchAutocomplete
  placeholderString={"Look for a specific tag, like 'italian', 'steak' or 'glutenfree'"}
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

<div class="prose mb-6">
  <h1>Recent Recipes</h1>
</div>

<div>
  {#if events.length > 0}
    <Feed {events} hideHide={true} />
  {:else}
    <p>loading</p>
  {/if}
</div>
