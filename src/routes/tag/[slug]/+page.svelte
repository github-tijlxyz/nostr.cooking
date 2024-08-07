<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/nostr';
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import Feed from '../../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import { recipeTags } from '$lib/consts';
  import { goto } from '$app/navigation';

  // let tag: string | undefined = undefined;
  let events: NDKEvent[] = [];
  let loaded = false;

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  function openTag(query: string) {
    goto(`/tag/${query}`);
  }

  async function loadData() {
    loaded = false;
    events = [];
    let filter: NDKFilter = {
      limit: 256,
      kinds: [30023],
      '#t': [`nostrcooking-${$page.params.slug.toLowerCase().replaceAll(' ', '-')}`]
    };
    const evts = await $ndk.fetchEvents(filter);
    let evtsArr = Array.from(evts);
    evtsArr.forEach((ev, i) => {
      if (validateMarkdownTemplate(ev.content) == null) {
        evtsArr.splice(i, 1);
      }
    });
    events = evtsArr;
    loaded = true;
  }
</script>

<svelte:head>
  <title>{$page.params.slug} Recipes</title>

  <meta name="description" content="View {$page.params.slug} Recipes on Zap Cooking" />
  <meta property="og:url" content="https://zap.cooking/tag/{$page.params.slug}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="{$page.params.slug} Recipes" />
  <meta property="og:description" content="View {$page.params.slug} Recipes on Zap Cooking" />
  <meta property="og:image" content="https://zap.cooking/logo_with_text.png" />

  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content="zap.cooking" />
  <meta property="twitter:url" content="https://zap.cooking/tag/{$page.params.slug}" />
  <meta name="twitter:title" content="{$page.params.slug} Recipes" />
  <meta name="twitter:description" content="View {$page.params.slug} Recipes on Zap Cooking" />
  <meta property="twitter:image" content="https://zap.cooking/logo_with_text.png" />
</svelte:head>

<div class="flex flex-col gap-8">
  <div class="prose">
    <!-- TODO: Clean up this mess -->
    <h1>
      Recipes with the tag "{#if $page.params.slug}{#if recipeTags.find((e) => e.title
              .toLowerCase()
              .replaceAll(' ', '-') == $page.params.slug
              ?.toLowerCase()
              .replaceAll(' ', '-'))}{recipeTags.find(
            (e) =>
              e.title.toLowerCase().replaceAll(' ', '-') ==
              $page.params.slug?.toLowerCase().replaceAll(' ', '-')
          )?.emoji
            ? `${
                recipeTags.find(
                  (e) =>
                    e.title.toLowerCase().replaceAll(' ', '-') ==
                    $page.params.slug?.toLowerCase().replaceAll(' ', '-')
                )?.emoji
              } ${
                recipeTags.find(
                  (e) =>
                    e.title.toLowerCase().replaceAll(' ', '-') ==
                    $page.params.slug?.toLowerCase().replaceAll(' ', '-')
                )?.title
              }`
            : `${
                recipeTags.find(
                  (e) =>
                    e.title.toLowerCase().replaceAll(' ', '-') ==
                    $page.params.slug?.toLowerCase().replaceAll(' ', '-')
                )?.title
              }`}{:else}{$page.params.slug}{/if}{:else}...{/if}"
    </h1>
  </div>

  {#if events.length > 0}
    <Feed {events} />
  {:else if loaded == false}
    <div class="flex justify-center items-center h-screen">
      <img class="w-64" src="/pan-animated.svg" alt="Loading" />
    </div>
  {:else}
    <p>Nothing found here :(</p>
  {/if}
</div>
