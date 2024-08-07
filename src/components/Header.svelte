<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from './Button.svelte';
  import { Avatar } from '@nostr-dev-kit/ndk-svelte-components';
  import { ndk, userPublickey } from '$lib/nostr';
  import SVGNostrCookingWithText from '../assets/nostr.cooking-withtext.svg';
  import UserIcon from 'phosphor-svelte/lib/User';
  import GearIcon from 'phosphor-svelte/lib/Gear';
  import AddIcon from 'phosphor-svelte/lib/Plus';
  import SignOutIcon from 'phosphor-svelte/lib/SignOut';
  import SearchIcon from 'phosphor-svelte/lib/MagnifyingGlass';
  import BookmarkIcon from 'phosphor-svelte/lib/Bookmark';
  import { nip19 } from 'nostr-tools';
  import { clickOutside } from '$lib/clickOutside';
  import { fade, blur } from 'svelte/transition';
  import TagsSearchAutocomplete from './TagsSearchAutocomplete.svelte';

  let dropdownActive = false;
  let searchActive = false;

  function openTag(query: string) {
    searchActive = false;
    if (query.startsWith('npub')) {
      goto(`/user/${query}`);
    } else if (query.startsWith('naddr')) {
      goto(`/recipe/${query}`);
    } else {
      goto(`/tag/${query}`);
    }
  }

  function logout() {
    localStorage.removeItem('nostrcooking_loggedInPublicKey');
    localStorage.removeItem('nostrcooking_privateKey');
    userPublickey.set('');
    setTimeout(() => (window.location.href = ''), 1);
  }
</script>

{#if searchActive}
  <div class="fixed z-20 w-full h-full top-0 left-0 duration-500 transition-opacity bg-opacity-50 backdrop-blur-sm" transition:blur={{ amount: 10, duration: 300 }}>
    <div class="fixed z-25 inset-x-0 top-20 w-3/4 md:w-1/2 lg:w-1/3 mx-auto" use:clickOutside on:click_outside={() => (searchActive = false)} >
        <TagsSearchAutocomplete
            placeholderString={"Search by tag, like 'italian', 'steak' or 'glutenfree'."}
            action={openTag}
            autofocus={true}
        />
    </div>
  </div>  
{/if}

<div class="flex gap-9 justify-between">
  <a href="/recent" class="flex-none">
    <img src={SVGNostrCookingWithText} class="w-40 my-3" alt="Nostr.Cooking Logo With Text" />
  </a>

  <div class="hidden lg:flex gap-10 self-center font-semibold">
    <a class="transition duration-300 hover:text-primary" href="/recent">Discover</a>
    <a class="transition duration-300 hover:text-primary" href="/tags">Categories</a>
  </div>

  <div class="hidden sm:flex flex-1 grow self-center">
    <TagsSearchAutocomplete
      placeholderString={"Search by tag, like 'italian', 'steak' or 'glutenfree'."}
      action={openTag}
    />
  </div>
  
  <div class="flex gap-4 self-center flex-none">
    <div class="block sm:hidden self-center">
      <Button class="self-center w-10 h-10 flex justify-center px-1 py-1 bg-[#FFECE8]" on:click={() => searchActive = true}>
        <SearchIcon class="self-center text-primary" size={16} weight="bold" />
      </Button>
    </div>
    {#if $userPublickey !== ''}
      <a class="hidden lg:flex self-center gap-2 transition duration-300 font-semibold hover:text-primary" href="/bookmarks">
        <BookmarkIcon class="self-center" size="30px" weight="bold" />
        <span class="self-center">Bookmarks</span>
      </a>
      <Button class="self-center max-md:w-10 max-md:h-10 flex max-md:justify-center max-md:px-1 max-md:py-1 font-semibold gap-2" on:click={() => goto('/create')}>
          <AddIcon class="self-center" size={16} />
          <div class="hidden md:flex">Add Recipe</div>
      </Button>
    {/if}
    <div class="self-center">
      {#if $userPublickey !== ''}
        <button class="flex self-center" on:click={() => (dropdownActive = !dropdownActive)}>
          <Avatar
            class="cursor-pointer w-12 h-12 object-center rounded-full"
            ndk={$ndk}
            pubkey={$userPublickey}
          />
        </button>
        {#if dropdownActive}
          <div class="relative z-20" transition:fade={{ delay: 0, duration: 150 }}>
            <div
              role="button"
              tabindex="-1"
              on:click={() => (dropdownActive = false)}
              on:keydown={(e) => e.key === 'Escape' && (dropdownActive = false)}
              use:clickOutside
              on:click_outside={() => (dropdownActive = false)}
              class="flex flex-col right-3 gap-4 absolute z-10 bg-white rounded-3xl drop-shadow px-5 py-6"
            >
              <button
                class="flex gap-2 cursor-pointer"
                on:click={() => goto(`/user/${nip19.npubEncode($userPublickey)}`)}
              >
                <UserIcon class="self-center" size={18} />
                Profile
              </button>
              <button class="flex gap-2 cursor-pointer" on:click={() => goto('/settings')}>
                <GearIcon class="self-center" size={18} />
                Settings
              </button>
              <button class="flex gap-2 cursor-pointer" on:click={logout}>
                <SignOutIcon class="self-center" size={18} />
                Log out
              </button>
            </div>
          </div>
        {/if}
      {:else}
        <Button on:click={() => goto('/login')} class="font-semibold" primary={false}
          >Sign in</Button
        >
      {/if}
    </div>
  </div>
</div>
