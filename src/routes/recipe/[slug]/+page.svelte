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
  import { goto } from '$app/navigation';
  import TagLinks from '../../../components/TagLinks.svelte';
  import 'zapthreads';
  import ExtraMenu from '../../../components/ExtraMenu.svelte';
  import { writable } from 'svelte/store';
  import { MoreVertical, Zap } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import TotalZaps from '../../../components/TotalZaps.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

  let isLoading = false;
  let event: NDKEvent;
  let zapModal = writable(false);
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
      setTimeout(() => {}, 2500);
    });
  }

  async function closeMenu() {
    setTimeout(() => {
      menu = false;
    }, 1);
    // setTimeout(() => {
    //   menu = true;
    // }, 7)
    // setTimeout(() => {
    //   menu = false;
    // }, 8)
  }

  async function zapEvt(amount: number, message: string) {
      isLoading = true;
      try {
    if (amount) {
      const a = await event.zap(amount * 1000, message);
      if (a) {
          const webln = await requestProvider();
          const res = await webln.sendPayment(a);
      }
          zapModal.set(false);
    }
     } catch (err) {
          console.log('error while handleing zap', err);
    } finally {
    isLoading = false;
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

<svelte:head>
  <title
    >{event ? (event.tags.find((e) => e[0] == 'title')?.[1]
      ? event.tags.find((e) => e[0] == 'title')?.[1]
      : event.tags.find((e) => e[0] == 'd')?.[1]) : '...'} on nostr.cooking</title
  >
</svelte:head>

<ZapModal {isLoading} submit={zapEvt} open={zapModal} />

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
            <!--&nbsp;•&nbsp; <TotalZaps {event} /> zapped-->
          </span>
          <span class="ml-auto mt-auto mb-auto p-1 pt-2">
            <span class="content-center">
              <div class="relative inline-block text-left">
                <div>

                  <Button variant="ghost" on:click={() => (zapModal.set(true))} class="hover:text-yellow-500">
                    <Zap />
                    <span class="flex ml-2"><TotalZaps {event} /></span>
                  </Button>

                  <DropdownMenu.Root >
                    <DropdownMenu.Trigger asChild let:builder> 
                        <Button builders={[builder]} variant="ghost"
                    >
                        <MoreVertical />
                    </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content class="w-56">

                    <ExtraMenu
                      {naddr}
                      {event}
                      {copyNaddr}
                      closeSelf={closeMenu}
                      openZapModal={() => (zapModal.set(true))}
                    />
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>
            </span>
          </span>
        </div>
        <p class="m-0">
          {#if event}
            <TagLinks {event} />
          {/if}
        </p>
      </div>
    </div>
    {#if event.tags.find((e) => e[0] == 'summary')}
      <blockquote>
        {event.tags.find((e) => e[0] == 'summary')?.[1]}
      </blockquote>
    {/if}
    {#if $translateOption.lang}
      {#await translate($translateOption, parseMarkdown(event.content))}
        ...
      {:then result}
        <!-- TODO: clean this up -->
        {#if result !== ''}
          {#if result.from.language.iso == $translateOption.lang}
            {@html parseMarkdown(event.content)}
          {:else}
            <hr />
            <p class="font-medium">
              Warning: The contents below are translated from <code>{result.from.language.iso}</code
              >
              to
              <code>{$translateOption.lang}</code>
              <a class="block" href="/settings">open translation setttings</a>
            </p>
            <hr />
            {@html result.text}
          {/if}
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
