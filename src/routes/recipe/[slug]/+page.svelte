<script lang="ts">
  import { page } from '$app/stores';
  import { recipeTags } from '$lib/consts';
  import { ndk, userPublickey, relays } from '$lib/nostr';
  import { parseMarkdown } from '$lib/pharser';
  import { formatDate } from '$lib/utils';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { requestProvider } from 'webln';
  import ZapModal from '../../../components/ZapModal.svelte';
  import { nip19 } from 'nostr-tools';
  import { translate } from '$lib/translation';
  import { translateOption } from '$lib/state';
  import TotalZaps from '../../../components/TotalZaps.svelte';
  import { goto } from '$app/navigation';

  let event: NDKEvent;
  let zapModal = false;

  async function zapEvt(amount: number, message: string) {
    zapModal = false;
    if (amount) {
      const a = await event.zap(amount * 1000, message);
      if (a) {
        try {
          const webln = await requestProvider();
          const res = await webln.sendPayment(a);
        } catch (err) {
          console.log('error while handleing zap', err);
        }
      }
    }
  }

  onMount(async () => {
    if ($page.params.slug.startsWith('naddr1')) {
      const b = nip19.decode($page.params.slug).data;
      let e = await $ndk.fetchEvent({
        // @ts-ignore
        '#d': [b.identifier],
        // @ts-ignore
        authors: [b.pubkey],
        kinds: [30023]
      });
      if (e) {
        event = e;
      }
    } else {
      let e = await $ndk.fetchEvent($page.params.slug);
      if (e) {
        event = e;
        const c = nip19.naddrEncode({
          // @ts-ignore
          identifier: e.tags.find((z) => z[0] == 'd')?.[1],
          // @ts-ignore
          kind: e.kind,
          pubkey: e.author.hexpubkey
        });
        goto(`/recipe/${c}`);
      }
    }
  });
</script>

{#if zapModal}
  <ZapModal submit={zapEvt} cancel={() => (zapModal = false)} />
{/if}

<article class="prose font-sans mx-auto px-6 py-6 pb-16">
  {#if event}
    <div class="flex mb-0">
      <!-- <div class="flex flex-col items-center space-y-2 mr-3">
			<button title="upvote"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M1 12h16L9 4l-8 8Z"></path></svg></button>
			<button title="downvote"><svg width="18" height="18" viewBox="0 0 18 18"><path d="M1 6h16l-8 8-8-8Z"></path></svg></button>
		</div> -->
      <div class="mb-0">
        <h1 class="mt-2 mb-4">
          {event.tags.find((e) => e[0] == 'title')?.[1]
            ? event.tags.find((e) => e[0] == 'title')?.[1]
            : event.tags.find((e) => e[0] == 'd')?.[1]}
        </h1>
        {#if event.tags.find((e) => e[0] == 'image')}
          <img class="mt-0 mb-0" src={event.tags.find((e) => e[0] == 'image')?.[1]} alt="image" />
        {/if}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <p class="mt-2 mb-0">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          by
          <a class="underline" href="/user/{event.author.npub}"
            >{#await event.author?.fetchProfile()}...{:then result}{#if result !== null && result.name}{result.name}{:else}...{/if}{/await}</a
          >
          {#if event.author.hexpubkey == $userPublickey}
            &nbsp;•&nbsp; <a href={`/fork/${event.id}`}>Edit</a>
          {:else if $userPublickey}
            &nbsp;•&nbsp; <a href={`/fork/${event.id}`}>Fork</a>{/if}
          &nbsp;•&nbsp; {#if $userPublickey}
            <a on:click={() => (zapModal = true)} class="underline cursor-pointer"> ⚡ Zap</a>{/if}
          {#if $userPublickey}({/if}<TotalZaps {event} /> zapped{#if $userPublickey}){/if} &nbsp;•&nbsp;
          updated on {event.created_at && formatDate(event.created_at)}
        </p>
        <p class="mb-6 mt-1">
          {#each event.tags.filter((e) => e[0] == 't' && e[1].startsWith('nostrcooking-') && e[1].slice(13) !== event.tags.find((a) => a[0] == 'd')?.[1]) as tag, i}{#if i !== 0}
              &nbsp;•&nbsp;
            {/if}<a href="/tag/{tag[1].slice(13)}" class="underline cursor-pointer"
              >{#if recipeTags.find((e) => e.title
                    .toLowerCase()
                    .replaceAll(' ', '-') == tag[1].slice(13))}{`${
                  recipeTags.find(
                    (e) => e.title.toLowerCase().replaceAll(' ', '-') == tag[1].slice(13)
                  )?.emoji
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
                }`}{:else}{tag[1].slice(13)}{/if}</a
            >{/each}
        </p>
      </div>
    </div>
    {#if event.tags.find((e) => e[0] == 'summary')}
      <p class="text-gray-600">
        {event.tags.find((e) => e[0] == 'summary')?.[1]}
      </p>
    {/if}
    {#if $translateOption.lang}
      {#await translate($translateOption.lang, parseMarkdown(event.content))}
        ...
      {:then result}
        {#if result.from.language.iso == $translateOption.lang}
          {@html parseMarkdown(event.content)}
        {:else}
          <hr />
          <p class="font-medium">
            Warning: The contents below are translated from <code>{result.from.language.iso}</code>
            to
            <code>{$translateOption.lang}</code>
            <a class="block" href="/settings">open translation setttings</a>
          </p>
          <hr />
          {@html result.text}
        {/if}
      {:catch err}
        <p class="font-medium">
          Error loading translation. Error Message: <code>{err}</code>

          <a class="block" href="/settings">open translation setttings</a>
        </p>
      {/await}
    {:else}
      {@html parseMarkdown(event.content)}
    {/if}
  {:else}
    <p>Loading...</p>
  {/if}
</article>
