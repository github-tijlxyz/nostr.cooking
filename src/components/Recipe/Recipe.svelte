<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import TagLinks from './TagLinks.svelte';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import { ndk } from '$lib/nostr';
  import { faBoltLightning } from '@fortawesome/free-solid-svg-icons';
  import Button from '../Button.svelte';
  import Fa from 'svelte-fa';
  import { translateOption } from '$lib/state';
  import { translate } from '$lib/translation';
  import { parseMarkdown } from '$lib/pharser';
  import TotalZaps from './TotalZaps.svelte';
  import TotalLikes from './TotalLikes.svelte';
  import TotalComments from './TotalComments.svelte';
  import Comments from '../Comments.svelte';
  import ZapModal from '../ZapModal.svelte';
  import { requestProvider } from 'webln';
  import { nip19 } from 'nostr-tools';

  export let event: NDKEvent;
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
</script>

{#if zapModal}
  <ZapModal submit={zapEvt} cancel={() => (zapModal = false)} />
{/if}

<article class="max-w-[760px] mx-auto">
  {#if event}
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-4">
        <h1>
          {event.tags.find((e) => e[0] === 'title')?.[1]
            ? event.tags.find((e) => e[0] === 'title')?.[1]
            : event.tags.find((e) => e[0] === 'd')?.[1]}
        </h1>
        <TagLinks {event} />
        <div class="flex gap-4">
          <a href="/user/{nip19.npubEncode(event.pubkey)}" class="flex gap-4 self-center">
            <Avatar class="w-14 h-14 rounded-full self-center" ndk={$ndk} pubkey={event.pubkey} />
            <Name class="self-center" ndk={$ndk} pubkey={event.pubkey} />
          </a>
          <Button class="flex self-center">Follow</Button>
        </div>
      </div>
      {#each event.tags.filter((e) => e[0] === 'image') as image, i}
        <img class="rounded-3xl aspect-video" src={image[1]} alt="Image {i + 1}" />
      {/each}
      <div class="flex gap-6">
        <TotalLikes {event} />
        <TotalComments {event} />
        <div class="cursor-pointer" on:click={() => zapModal = true}>
          <TotalZaps {event} />
        </div>
      </div>
      <div class="prose">
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
                  Warning: The contents below are translated from <code
                    >{result.from.language.iso}</code
                  >
                  to
                  <code>{$translateOption.lang}</code>
                  <a class="block" href="/settings">open translation setttings</a>
                </p>
                <hr />
                <!-- TODO: FIX SCRIPT INJECTION -->
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
      </div>
      <Comments {event} />
    </div>
  {:else}
    Loading...
  {/if}
</article>
