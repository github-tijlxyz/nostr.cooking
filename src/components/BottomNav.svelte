<script>
  import { faBookmark, faList, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
</script>

<nav class="md:hidden pt-2 bg-white w-full fixed bottom-0 grid grid-cols-3 grid-rows-1 text-center">
  <a href="/recent" class="flex flex-col">
    <Fa size="1.5x" icon={faMagnifyingGlass} />
    Discover
  </a>
  <a href="/tags" class="flex flex-col">
    <Fa size="1.5x" icon={faList} />
    Categories
  </a>
  <a href="/bookmarks" class="flex flex-col">
    <Fa size="1.5x" icon={faBookmark} />
    Bookmarks
  </a>
</nav>
