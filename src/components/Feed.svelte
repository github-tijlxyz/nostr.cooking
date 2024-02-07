<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import RecipeCard from './RecipeCard.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';

  export let events: NDKEvent[];
  export let hideHide = false;

  events = events.filter((e) => typeof validateMarkdownTemplate(e.content) !== 'string');
</script>

<div class="grid gap-x-4 gap-y-10 grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
  {#each events as event}
    {#if !(hideHide == true && event.tags.find((t) => t[0] == 't' && t[1] == 'nostrcooking-hide'))}
      <RecipeCard {event} />
    {/if}
  {/each}
</div>
