<script lang="ts">
  import { page } from '$app/stores';
  import { ndk, userPublickey, relays } from '$lib/nostr';
  import { parseMarkdown } from '$lib/pharser';
  import { formatDate } from '$lib/utils';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { requestProvider } from 'webln';
  import ZapModal from '../../../components/ZapModal.svelte';
  import { nip19 } from 'nostr-tools';
  import { translate } from '$lib/translation';
  import { translateOption } from '$lib/state';
  import TotalZaps from '../../../components/TotalZaps.svelte';
  import { goto } from '$app/navigation';
  import TagLinks from '../../../components/TagLinks.svelte';
  import 'zapthreads';
  import ExtraMenu from '../../../components/ExtraMenu.svelte';

  let event: NDKEvent;
  let zapModal = false;
  let naddr: string = '';
  let menu = false;

  // for zapthreads
  let key = '';
  let sk = localStorage.getItem('nostrcooking_privateKey');
  if (sk) {
    key = nip19.nsecEncode(sk);
  } else if ($userPublickey) {
    key = nip19.npubEncode($userPublickey);
  }

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  async function copyNaddr() {
    const type = 'text/plain';
    const blob = new Blob([naddr], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(data).then(() => {
      setTimeout(() => {
      }, 2500);
    });
  }

  async function closeMenu() {
    setTimeout(() => {
      menu = false;
    }, 1)
    // setTimeout(() => {
    //   menu = true;
    // }, 7)
    // setTimeout(() => {
    //   menu = false;
    // }, 8)
  }

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

  async function loadData() {
    if ($page.params.slug.startsWith('naddr1')) {
      const b = nip19.decode($page.params.slug).data;
      naddr = nip19.naddrEncode({
        // @ts-ignore
        identifier: b.identifier,
        // @ts-ignore
        pubkey: b.pubkey,
        kind: 30023
      });
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
        naddr = nip19.naddrEncode({
          // @ts-ignore
          identifier: e.tags.find((z) => z[0] == 'd')?.[1],
          // @ts-ignore
          kind: e.kind,
          pubkey: e.author.hexpubkey
        });
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
  }
</script>

{#if zapModal}
  <ZapModal submit={zapEvt} cancel={() => (zapModal = false)} />
{/if}

<article class="prose font-sans mx-auto px-6 py-6 pb-16">
  {#if event}
    <div class="flex mb-0">
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
        <div class="mt-2 mb-0 flex col-span-2">
          <span class="text-left">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            by
            <a class="underline" href="/user/{event.author.npub}"
              >{#await event.author?.fetchProfile()}...{:then result}{#if result !== null && result.name}{result.name}{:else}...{/if}{/await}</a
            >
            &nbsp;•&nbsp; updated on {event.created_at && formatDate(event.created_at)}
            &nbsp;•&nbsp; <TotalZaps {event} /> zapped
          </span>
          <span class="ml-auto mt-auto mb-auto p-1 pt-2">
            <span class="content-center">
              <div class="relative inline-block text-left">
                <div>              
              <button
                on:click={() => menu = !menu}
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-7 h-7"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                  />
                </svg>
              </button>
              <!-- menu -->
              {#if menu}
              <ExtraMenu {event} {copyNaddr} closeSelf={closeMenu} openZapModal={() => zapModal = true} />
              {/if}
              </div>
              </div> 
            </span>
          </span>
        </div>
        <p class="mb-6 mt-1">
          {#if event}
            <TagLinks {event} />
          {/if}
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
    <zap-threads
      anchor={$page.params.slug}
      relays={relays.join(',')}
      npub={key}
      url-prefixes={'naddr:nostr.cooking/recipe/,npub:nostr.cooking/user/'}
      disable={'likes,zaps,replyAnonymously'}
    />
  {:else}
    <p>Loading...</p>
  {/if}
</article>
