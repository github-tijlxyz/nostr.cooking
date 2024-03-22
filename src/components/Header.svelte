<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from './Button.svelte';
  import { Avatar } from '@nostr-dev-kit/ndk-svelte-components';
  import { ndk, userPublickey } from '$lib/nostr';
  import SVGNostrCookingWithText from '../assets/nostr.cooking-withtext.svg';
  import UserIcon from 'phosphor-svelte/lib/User';
  import GearIcon from 'phosphor-svelte/lib/Gear';
  import WalletIcon from 'phosphor-svelte/lib/Wallet';
  import AddIcon from 'phosphor-svelte/lib/Plus';
  import SignOutIcon from 'phosphor-svelte/lib/SignOut';
  import { nip19 } from 'nostr-tools';
  import { clickOutside } from '$lib/clickOutside';
  import { fade } from 'svelte/transition';

  let dropdownActive = false;

  function logout() {
    localStorage.removeItem('nostrcooking_loggedInPublicKey');
    localStorage.removeItem('nostrcooking_privateKey');
    userPublickey.set('');
    setTimeout(() => (window.location.href = ''), 1);
  }
</script>

<div class="flex gap-9 sm:px-6">
  <a href="/recent" class="grow md:grow-0">
    <img src={SVGNostrCookingWithText} class="w-40 my-3" alt="Nostr.Cooking Logo With Text" />
  </a>

  <div class="hidden md:flex grow gap-10 self-center font-semibold">
    <a class="transition duration-300 hover:text-primary" href="/recent">Discover</a>
    <a class="transition duration-300 hover:text-primary" href="/tags">Categories</a>
    <a class="transition duration-300 hover:text-primary" href="/bookmarks">Bookmarks</a>
  </div>

  <div class="flex gap-4 self-center">
    {#if $userPublickey !== ''}
      <Button class="self-center" on:click={() => goto('/create')}>
        <div class="flex gap-2 font-semibold">
          <AddIcon class="self-center" size={18} />
          <div class="hidden md:flex">Add Recipe</div>
        </div>
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
              on:keydown={(e) => e. key === 'Escape' && (dropdownActive = false)}
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
