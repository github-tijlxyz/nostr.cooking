<script lang="ts">
  import { userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import AddBookmark from './AddBookmark.svelte';

  let show = true;
  export let event: NDKEvent;
  export let openZapModal: () => void;
  export let copyNaddr: () => void;
  export let closeSelf: () => void;
  export let didCopy: boolean;
</script>

{#if show}
<div
  class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
  role="menu"
  aria-orientation="vertical"
  aria-labelledby="menu-button"
  tabindex="-1"
>
  <div class="py-1" role="none">
    <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" -->
    <button
      on:click={() => {openZapModal();closeSelf()}}
      class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
      ><span
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 inline text-center mr-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
        Zap!</span
      ></button
    >
    <AddBookmark {event} close={closeSelf} />
    <button
    on:click={() => {copyNaddr();closeSelf()}}
    class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
    ><span
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 inline text-center mr-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
        />
      </svg>
      {#if didCopy}Copied!{:else}Copy naddr{/if}</span
    ></button
  >
  </div>
</div>

<!-- {#if $userPublickey} <AddBookmark {event} /> {/if} -->

<!-- &nbsp;•&nbsp;
          <a class="underline cursor-pointer" on:click={copyNaddr}
            >{#if didCopy}copied!{:else}copy naddr{/if}</a
          > -->
<!-- {#if event.author.hexpubkey == $userPublickey}
            &nbsp;•&nbsp; <a href={`/fork/${naddr}`}>Edit</a>
          {:else if $userPublickey}
            &nbsp;•&nbsp; <a href={`/fork/${naddr}`}>Fork</a>{/if} -->
<!-- {#if $userPublickey}
            &nbsp;•&nbsp; <a on:click={() => (zapModal = true)} class="underline cursor-pointer">
              ⚡ Zap</a
            >{/if} -->
{/if}