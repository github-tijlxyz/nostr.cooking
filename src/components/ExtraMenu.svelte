<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import AddBookmark from './AddBookmark.svelte';
  import { userPublickey } from '$lib/nostr';
  import { goto } from '$app/navigation';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Copy, Download, GitFork, Pencil } from 'lucide-svelte';

  let show = true;
  export let event: NDKEvent;
  export let openZapModal: () => void;
  export let copyNaddr: () => void;
  export let closeSelf: () => void;
  export let naddr: string;

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
      title = 'recipe';
    }
    title += '.md';
    a.download = title;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    closeSelf();
  }
</script>

<AddBookmark {event} close={closeSelf} />
<DropdownMenu.Item on:click={() => goto(`/fork/${naddr}`)}>
    {#if event.pubkey == $userPublickey}
    <Pencil class="mr-2 h-4 w-4" />
    {:else}
    <GitFork class="mr-2 h-4 w-4" />
    {/if}
    <span>{#if event.pubkey == $userPublickey}Edit{:else}Fork{/if}</span>
</DropdownMenu.Item>
<DropdownMenu.Item on:click={copyNaddr}> 
    <Copy class="mr-2 h-4 w-4" />
    <span>Copy naddr</span>
</DropdownMenu.Item>
<DropdownMenu.Item on:click={saveAsMD}> 
    <Download class="mr-2 h-4 w-4" />
    <span>Save as Markdown</span>
</DropdownMenu.Item>

<!--
  <div
    class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1"
  >
    <div class="py-1" role="none">
      {#if $userPublickey !== ''}
        <AddBookmark {event} close={closeSelf} />
        <button
          on:click={() => {
            goto(`/fork/${naddr}`);
            closeSelf();
          }}
          class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
          ><span
            >

            {#if event.pubkey == $userPublickey}Edit{:else}Fork{/if}</span
          ></button
        >
      {/if}
      <button
        on:click={() => {
          copyNaddr();
          closeSelf();
        }}
        class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
        ><span
          >          Copy naddr</span
        ></button
      >
      <button
        on:click={() => {
          saveAsMD();
          closeSelf();
        }}
        class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
        ><span
          >

          Save as Markdown</span
        ></button
      >
    </div>
  </div>
  -->
