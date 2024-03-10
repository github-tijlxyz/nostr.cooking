<script lang="ts">
  import KeyIcon from 'phosphor-svelte/lib/Key';
  import Button from '../../components/Button.svelte';
  import { ndk, userPublickey } from '$lib/nostr';
  import { browser } from '$app/environment';
  import { NDKNip07Signer, NDKNip46Signer } from '@nostr-dev-kit/ndk';
  import { goto } from '$app/navigation';

  async function loadUserData() {
    if ($ndk.signer && $userPublickey == '') {
      const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
      localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
      $userPublickey = newUserPublicKey;
      userPublickey.set($userPublickey);
    }
    if ($ndk.signer) {
      console.log('signer activated');
      goto('/');
    }
  }

  async function loginWithNIP07() {
    if (browser) {
      if (!$ndk.signer) {
        try {
          const signer = new NDKNip07Signer();
          $ndk.signer = signer;
          ndk.set($ndk);
        } catch (err) {}
      }
    }
    loadUserData();
  }
</script>

<svelte:head>
  <title>login to nostr.cooking</title>
</svelte:head>

<div class="flex flex-col gap-8 justify-center items-center text-center">
  <div class="flex flex-col gap-6">
    <div class="text-3xl font-semibold">Sign in</div>
    <div class="flex flex-col gap-4">
      <button
        on:click={loginWithNIP07}
        class="flex w-[320px] h-[52px] gap-2 shadow rounded-xl justify-center text-center font-semibold border box-border border-[#D1D3DC]"
      >
        <span
          class="flex justify-center items-center rounded-full bg-[#FA9101] self-center w-10 h-10 text-white"
        >
          <KeyIcon size={24} />
        </span>
        <span class="self-center">Sign in with extension</span>
      </button>
    </div>
  </div>
  <div class="flex flex-col font-semibold gap-3">
    Don't have an account?
    <Button class="self-center" primary={false}>Sign up</Button>
  </div>
</div>
