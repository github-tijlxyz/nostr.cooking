<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import FeedItem from './FeedItem.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';

  export let events: NDKEvent[];
  export let hideHide = false;

  events = events.filter((e) => typeof validateMarkdownTemplate(e.content) !== 'string');
</script>

<div class="">
  {#each events as event}
    {#if !(hideHide == true && event.tags.find((t) => t[0] == 't' && t[1] == 'nostrcooking-hide'))}
      <FeedItem {event} />
    {/if}
  {/each}
</div>
