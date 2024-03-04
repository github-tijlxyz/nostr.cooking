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

  async function tryLoginWithNIP07() {
    if (browser) {
      if (!$ndk.signer) {
        try {
          const signer = new NDKNip07Signer();
          $ndk.signer = signer;
          ndk.set($ndk);
        } catch (err) {}
      }
      if (!$userPublickey) {
        loadUserData();
      }
    }
  }

  async function tryAuthenticateLocalPrivatekey() {
    if (!$ndk.signer) {
      try {
        const sk = localStorage.getItem('nostrcooking_privateKey');
        if (sk) {
          const signer = new NDKPrivateKeySigner(sk);
          $ndk.signer = signer;
          ndk.set($ndk);
        }
      } catch (err) {}
    }
    if (!$userPublickey) {
      loadUserData();
    }
  }

  onMount(() => {
    setTimeout(async () => {
      const pk = localStorage.getItem('nostrcooking_loggedInPublicKey');
      const sk = localStorage.getItem('nostrcooking_privateKey');

      if (sk && pk) {
        tryAuthenticateLocalPrivatekey();
      } else if (pk) {
        tryLoginWithNIP07();
      } else {
        localStorage.removeItem('nostrcooking_loggedInPublicKey');
        localStorage.removeItem('nostrcooking_privateKey');
      }
    }, 5);
  });
</script>

<svelte:head>
  <link rel="preload" as="image" href="/placeholder.png" />
</svelte:head>

<div class="h-[100%] scroll-smooth">
  <div class="flex h-screen">
    <div class=" mx-auto flex-1 pt-3 px-3">
      <Header />
      <div class="container mx-auto mt-6 pb-24">
        <slot />
      </div>
      <BottomNav />
    </div>
  </div>
</div>
