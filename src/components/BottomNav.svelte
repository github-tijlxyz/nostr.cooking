<script lang="ts">
  import MagnifyingIcon from 'phosphor-svelte/lib/MagnifyingGlass';
  import LightningIcon from 'phosphor-svelte/lib/Lightning';
  import BookmarkIcon from 'phosphor-svelte/lib/BookmarkSimple';
</script>

<nav
  class="md:hidden pt-2 bg-white w-full fixed bottom-0 left-0 grid grid-cols-3 grid-rows-1 text-center"
>
  <a href="/recent" class="flex flex-col">
    <MagnifyingIcon class="self-center" size={24} />
    Discover
  </a>
  <a href="/tags" class="flex flex-col">
    <LightningIcon class="self-center" size={24} />
    Categories
  </a>
  <a href="/bookmarks" class="flex flex-col">
    <BookmarkIcon class="self-center" size={24} />
    Bookmarks
  </a>
</nav>
