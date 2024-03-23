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

  function openTag(query: string) {
    if (query.startsWith('npub')) {
      goto(`/user/${query}`);
    } else if (query.startsWith('naddr')) {
      goto(`/recipe/${query}`);
    } else {
      goto(`/tag/${query}`);
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

<div class="flex flex-col gap-3 md:gap-10">
  <div class="flex flex-col gap-2">
    <div>
      <h2>
        {#if $userPublickey}
          What are you in the mood for <Name
            ndk={$ndk}
            pubkey={$userPublickey}
            npubMaxLength={10}
          />?
        {:else}
          What are you in the mood for?
        {/if}
      </h2>
    </div>
    <TagsSearchAutocomplete
      placeholderString={"Search by tag, like 'italian', 'steak' or 'glutenfree'."}
      action={openTag}
    />
  </div>

  <div class="flex flex-col gap-2">
    <div class="flex">
      <h2 class="grow">Popular Categories</h2>
      <a
        href="/tags"
        class="self-center text-primary hover:text-[#d64000] transition-colors duration-300"
        >View All</a
      >
    </div>

    <div class="grid grid-cols-4 md:flex gap-4 overflow-y-hidden overflow-x-auto">
      {#each popTags as tag}
        <a
          href="/tag/{tag.title}"
          class="flex flex-col gap-2 hover:text-primary transition-colors duration-300"
        >
          <div
            class="table w-16 h-16 bg-input hover:bg-accent-gray transition-colors duration-300 rounded-full place-self-center"
          >
            <div class="table-cell align-middle place-self-center text-center text-4xl">
              {tag.emoji}
            </div>
          </div>
          <div class="place-self-center">{tag.title}</div>
        </a>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h2>Recent Recipes</h2>
    <div><Feed {events} hideHide={true} /></div>
  </div>
</div>
