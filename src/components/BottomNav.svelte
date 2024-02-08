<script>
  import { faBookmark, faList, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
</script>

<div class="md:hidden pt-2 bg-white w-full fixed bottom-0 grid grid-cols-3 grid-rows-1 text-center">
  <div class="flex flex-col">
    <Fa size="1.5x" icon={faMagnifyingGlass} />
    Discover
  </div>
  <div class="flex flex-col">
    <Fa size="1.5x" icon={faList} />
    Categories
  </div>
  <div class="flex flex-col">
    <Fa size="1.5x" icon={faBookmark} />
    Lists
  </div>
</div>