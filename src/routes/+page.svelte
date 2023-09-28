<script lang="ts">
  import { ndk } from '$lib/nostr';
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Feed from '../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import TagsSearchAutocomplete from '../components/TagsSearchAutocomplete.svelte';
  import { goto } from '$app/navigation';

  let events: NDKEvent[] = [];

  function openTag(query: string) {
    goto(`/r/tag/${query}`);
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

<div class="prose mb-6">
  <h1>Recent Recipes</h1>
</div>

<div>
  {#if events.length > 0}
    <Feed {events} />
  {:else}
    <p>loading</p>
  {/if}
</div>
