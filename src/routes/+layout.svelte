<script>
  import { onMount } from 'svelte';
  import '../app.css';
  import Header from '../components/Header.svelte';
  import { browser } from '$app/environment';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { ndk, userPublickey } from '$lib/nostr';

  async function login() {
    if (browser) {
      if (!$ndk.signer) {
        try {
          const signer = new NDKNip07Signer();
          $ndk.signer = signer;
          ndk.set($ndk);
        } catch (err) {}
      }
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
  }

  onMount(() => {
    setTimeout(async () => {
      await login();
    }, 5);
  });
</script>

<svelte:head />

<div class="h-[100%] scroll-smooth">
  <div class="flex h-screen">
    <div class="container mx-auto flex-1 overflow-y-auto pt-3">
      <Header />
      <div class="pb-24">
        <slot />
      </div>
    </div>
  </div>
</div>
