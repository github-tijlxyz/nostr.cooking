<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import AddBookmark from './AddBookmark.svelte';

  let show = true;
  export let event: NDKEvent;
  export let openZapModal: () => void;
  export let copyNaddr: () => void;
  export let closeSelf: () => void;

  function saveAsMD() {
    const blob = new Blob([event.content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let title: undefined | string = undefined;
    title = event.tags.find((a) => a[0] == 'title')?.[1];
    if (title == undefined) {
      title = event.tags.find((a) => a[0] == 'd')?.[1];
    }
    if (title == undefined) {
      title = 'recipe'
    }
    title += '.md'
    a.download = title;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    closeSelf();
  }
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
      <button
        on:click={() => {
          openZapModal();
          closeSelf();
        }}
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
        on:click={() => {
          copyNaddr();
          closeSelf();
        }}
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
          Copy naddr</span
        ></button
      >
      <button
        on:click={() => {
          saveAsMD();
          closeSelf();
        }}
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>

          Save as Markdown</span
        ></button
      >
    </div>
  </div>
{/if}
