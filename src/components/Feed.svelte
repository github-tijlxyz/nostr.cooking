<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import RecipeCard from './RecipeCard.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';

  export let events: NDKEvent[];
  export let hideHide = false;
  export let lists = false;
  if (!lists)
    events = events.filter((e) => typeof validateMarkdownTemplate(e.content) !== 'string');
</script>

<div
  class="grid gap-x-2 gap-y-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
>
  {#if events.length > 0}
    {#each events as event}
      {#if !(hideHide == true && event.tags.find((t) => t[0] == 't' && t[1] == 'nostrcooking-hide'))}
        <RecipeCard list={lists} {event} />
      {/if}
    {/each}
  {:else}
    {#each new Array(24) as i}
      <div class="flex flex-col gap-4 max-w-[160px]">
        <div
          class="rounded-3xl w-[160px] h-[237px] cursor-pointer transition relative overflow-hidden bg-cover bg-center animate-pulse"
          style="background-image: url('/placeholder.png');"
        />

        <h5 class="text-md leading-tight text-wrap text-input bg-input animate-pulse">
          PLACEHOLDER RECIPE {i}
        </h5>
      </div>
    {/each}
  {/if}
</div>
