<script lang="ts">
  import { goto } from '$app/navigation';
  import { recipeTags } from '$lib/consts';
  import { formatDate } from '$lib/utils';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import TotalZaps from './TotalZaps.svelte';

  export let event: NDKEvent;

  async function open() {
    if (event.id && event.sig) {
      goto(`/recipe/${event.id}`);
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:click={open}
  class="rounded-lg h-[256px] cursor-pointer mb-2 border border-slate-500 transition relative overflow-hidden hover:bg-slate-100 {event.tags.find(
    (e) => e[0] == 'image'
  )?.[0]
    ? 'bg-cover text-white'
    : 'bg-slate-50'}"
  style={`${
    event.tags.find((e) => e[0] == 'image')?.[0] &&
    `background-image: url('${event.tags.find((e) => e[0] == 'image')?.[1]}');`
  }`}
>
  {#if event.tags.find((e) => e[0] == 'image')?.[0]}
    <div class="absolute inset-0 bg-black opacity-[0.65] transition-all" />
  {/if}
  <div class="p-6 relative">
    <h5 class="text-3xl font-medium leading-tight">
      {#if event?.tags.find((e) => e[0] == 'title')?.[0] && event?.tags.find((e) => e[0] == 'title')?.[1]}
        {event.tags.find((e) => e[0] == 'title')?.[1]}
      {:else}
        {event.tags.find((e) => e[0] == 'd')?.[1]}
      {/if}
    </h5>
    <p class="text-base mt-0">
      {#each event.tags.filter((e) => e[0] == 't' && e[1].startsWith('nostrcooking-') && e[1].slice(13) !== event.tags.find((a) => a[0] == 'd')?.[1]) as tag, i}{#if i !== 0}
          &nbsp;•&nbsp;
        {/if}{#if recipeTags.find((e) => e.title
              .toLowerCase()
              .replaceAll(' ', '-') == tag[1].slice(13))}{`${
            recipeTags.find((e) => e.title.toLowerCase().replaceAll(' ', '-') == tag[1].slice(13))
              ?.emoji
              ? `${
                  recipeTags.find(
                    (e) => e.title.toLowerCase().replaceAll(' ', '-') == tag[1].slice(13)
                  )?.emoji
                } ${
                  recipeTags.find(
                    (e) => e.title.toLowerCase().replaceAll(' ', '-') == tag[1].slice(13)
                  )?.title
                }`
              : `${
                  recipeTags.find(
                    (e) => e.title.toLowerCase().replaceAll(' ', '-') == tag[1].slice(13)
                  )?.title
                }`
          }`}{:else}{tag[1].slice(13)}{/if}{/each}
    </p>
    {#if event.sig}
      <p class="text-base mb-2 mt-0">
        by {#await event.author?.fetchProfile()}...{:then result}{#if result !== null && result.name}{result.name}{:else}...{/if}{/await}
        &nbsp;•&nbsp; updated on {event.created_at && formatDate(event.created_at)}
		&nbsp;•&nbsp; <TotalZaps {event} /> zapped
      </p>
    {:else}
      <div class="mb-2" />
    {/if}
    {#if event?.tags.find((e) => e[0] == 'summary')?.[0] && event?.tags.find((e) => e[0] == 'summary')?.[1]}
      <p class="text-base">
        {event?.tags
          .find((e) => e[0] == 'summary')?.[1]
          .slice(
            0,
            192
          )}{#if String(event.tags.find((e) => e[0] == 'summary')?.[1])?.length > 192}...{/if}
      </p>
    {:else}
      <p class="text-base">no summary ...</p>
    {/if}
  </div>
</div>
