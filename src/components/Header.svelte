<script lang="ts">
  import { goto } from "$app/navigation"
  import Button from './Button.svelte';
  import { Avatar } from "@nostr-dev-kit/ndk-svelte-components"
  import { ndk, userPublickey } from '$lib/nostr';
  import SVGNostrCookingWithText from '../assets/nostr.cooking-withtext.svg';
  import Fa from "svelte-fa";
  import { faAdd, faGear, faUser, faWallet, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
  import { nip19 } from 'nostr-tools';

  let dropdownActive = false;
</script>

<div class="flex gap-9">
  <a href="/recent" class="grow md:grow-0">
    <img
      src={SVGNostrCookingWithText}
      class="w-40 my-3"
      alt="Nostr.Cooking Logo With Text"
    />
  </a>

  <div class="hidden md:flex grow gap-10 self-center font-semibold">
    <a href="/recent">Discover</a>
    <a href="/tags">Categories</a>
    <a href="/bookmarks">Lists</a>
  </div>

  <div class="flex gap-4 self-center">
    <Button class="self-center" on:click={() => goto("/user")}>
      <div class="flex gap-2 font-semibold">
        <Fa class="self-center" icon={faAdd} />
        <div class="hidden md:flex">
          Add Recipe
        </div>
      </div>
    </Button>
    <div class="self-center">
      {#if $userPublickey !== ""}
        <div on:click={() => dropdownActive = !dropdownActive}>
          <Avatar class="cursor-pointer w-12 h-12 object-center rounded-full" ndk={$ndk} pubkey={$userPublickey} />
        </div>
        {#if dropdownActive}
          <div class="flex flex-col right-3 gap-4 absolute z-10 bg-white rounded-3xl drop-shadow px-5 py-6">
            <span class="flex gap-2 cursor-pointer" on:click={() => goto(`/user/${nip19.npubEncode($userPublickey)}`)}>
              <Fa class="self-center" icon={faUser} />
              Profile
            </span>
            <span class="flex gap-2 cursor-pointer" on:click={() => goto("/settings")}>
              <Fa class="self-center" icon={faGear} />
              Settings
            </span>
            <span class="flex gap-2 cursor-pointer" on:click={() => goto("/wallet")}>
              <Fa class="self-center" icon={faWallet} />
              Wallet
            </span>
            <span class="flex gap-2 cursor-pointer" on:click={() => goto("/settings")}>
              <Fa class="self-center" icon={faRightFromBracket} />
              Log out
            </span>
          </div>
        {/if}
      {:else}
        <Button on:click={() => goto("/login")} class="font-semibold" primary={false}>Sign in</Button>
      {/if}
    </div>
  </div>
</div>