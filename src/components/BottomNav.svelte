<script>
    import { goto } from '$app/navigation';
  import { faBookmark, faList, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
</script>

<div class="md:hidden pt-2 bg-white w-full fixed bottom-0 grid grid-cols-3 grid-rows-1 text-center">
  <button on:click={() => goto("/")} class="flex flex-col">
    <Fa size="1.5x" icon={faMagnifyingGlass} />
    Discover
  </button>
  <button on:click={() => goto("/")} class="flex flex-col">
    <Fa size="1.5x" icon={faList} />
    Categories
  </button>
  <button on:click={() => goto("/bookmarks")} class="flex flex-col">
    <Fa size="1.5x" icon={faBookmark} />
    Bookmarks
  </button>
</div>
