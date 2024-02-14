<script>
  import { onMount } from 'svelte';
  import '../app.css';
  import Header from '../components/Header.svelte';
  import { browser } from '$app/environment';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { ndk, userPublickey } from '$lib/nostr';
  import BottomNav from '../components/BottomNav.svelte';

  async function loadUserData() {
    if ($ndk.signer && $userPublickey == '') {
      const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
      localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
      $userPublickey = newUserPublicKey;
      userPublickey.set($userPublickey);
    }
    if ($ndk.signer) {
      console.log('signer activated');
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

  async function tryAuthenticateLocalPrivatekey() {
    if (!$ndk.signer) {
      try {
        const pk = localStorage.getItem('nostrcooking_privateKey');
        if (pk) {
          const signer = new NDKPrivateKeySigner(pk);
          $ndk.signer = signer;
          ndk.set($ndk);
        }
      } catch (err) {}
    }
    loadUserData();
  }

  onMount(() => {
    setTimeout(async () => {
      tryAuthenticateLocalPrivatekey();

      const triedAutoNIP07Login = localStorage.getItem('triedAutoNIP07Login');
      console.log(triedAutoNIP07Login)
      if (triedAutoNIP07Login == null) {
        console.log("NO ATTEMPT!")
        localStorage.setItem('triedAutoNIP07Login', '1');
        await loginWithNIP07();
      }
    }, 5);
  });
</script>

<svelte:head />

<div class="h-[100%] scroll-smooth">
  <div class="flex h-screen">
    <div class="container mx-auto flex-1 overflow-y-auto pt-3">
      <Header />
      <div class="mt-6 pb-24">
        <slot />
      </div>
      <BottomNav />
    </div>
  </div>
</div>
