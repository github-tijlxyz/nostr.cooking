<script lang="ts">
  import KeyIcon from 'phosphor-svelte/lib/Key';
  import SeedIcon from 'phosphor-svelte/lib/Plant';
  import Button from '../../components/Button.svelte';
  import { ndk, userPublickey } from '$lib/nostr';
  import { browser } from '$app/environment';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { goto } from '$app/navigation';
  import Modal from '../../components/Modal.svelte';
  import { nip06, nip19 } from 'nostr-tools';

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

  let nsecInput = '';
  let nsecError = '';
  async function loginWithSk() {
    try {
      if (browser && nsecInput) {
        let pk = nsecInput;
        if (!$ndk.signer) {
          if (pk.startsWith('nsec1')) {
            pk = nip19.decode(pk).data.toString();
          }
          const signer = new NDKPrivateKeySigner(pk);
          $ndk.signer = signer;
          ndk.set($ndk);
        }
        if ($ndk.signer) {
          localStorage.setItem('nostrcooking_privateKey', pk);
        }
        if ($ndk.signer && $userPublickey == '') {
          const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
          localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
          $userPublickey = newUserPublicKey;
          userPublickey.set($userPublickey);
        }
        goto('/');
      }
    } catch (error) {
      nsecError = 'Error! Make sure private key is valid.';
      console.error(error);
    }
  }

  let nsecModal = false;

  function nsecModalCleanup() {
    nsecModal = false;
  }

  let seedInput = '';
  let seedError = '';
  async function loginWithSeed() {
    try {
      if (browser && seedInput) {
        let pk = nip06.privateKeyFromSeedWords(seedInput);
        if (!$ndk.signer) {
          if (pk.startsWith('nsec1')) {
            pk = nip19.decode(pk).data.toString();
          }
          const signer = new NDKPrivateKeySigner(pk);
          $ndk.signer = signer;
          ndk.set($ndk);
        }
        if ($ndk.signer) {
          localStorage.setItem('nostrcooking_privateKey', pk);
        }
        if ($ndk.signer && $userPublickey == '') {
          const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
          localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
          $userPublickey = newUserPublicKey;
          userPublickey.set($userPublickey);
        }
        goto('/');
      }
    } catch (error) {
      seedError = 'Error! Make sure seed is valid.';
      console.error(error);
    }
  }

  let seedModal = false;

  function seedModalCleanup() {
    seedModal = false;
  }
</script>

<svelte:head>
  <title>login to nostr.cooking</title>
</svelte:head>

<Modal open={nsecModal} cleanup={nsecModalCleanup}>
  <h2 slot="title">Login with Private Key</h2>
  <input class="input" type="text" bind:value={nsecInput} placeholder="nsec1..." />
  <div class="flex">
    <span class="flex grow text-danger self-center">{nsecError}</span>
    <div class="flex gap-2 justify-end">
      <Button
        class="!text-black bg-white border border-[#ECECEC] hover:bg-accent-gray"
        on:click={nsecModalCleanup}>Cancel</Button
      >
      <Button on:click={loginWithSk}>Login</Button>
    </div>
  </div>
</Modal>

<Modal open={seedModal} cleanup={seedModalCleanup}>
  <h2 slot="title">Login with Seed</h2>
  <input
    class="input"
    type="text"
    bind:value={seedInput}
    placeholder="beyond mobile enough risk kite mechanic exact around..."
  />
  <div class="flex">
    <span class="flex grow text-danger self-center">{seedError}</span>
    <div class="flex gap-2 justify-end">
      <Button
        class="!text-black bg-white border border-[#ECECEC] hover:bg-accent-gray"
        on:click={seedModalCleanup}>Cancel</Button
      >
      <Button on:click={loginWithSeed}>Login</Button>
    </div>
  </div>
</Modal>

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
      <button
        on:click={() => (nsecModal = true)}
        class="flex w-[320px] h-[52px] gap-2 shadow rounded-xl justify-center text-center font-semibold border box-border border-[#D1D3DC]"
      >
        <span
          class="flex justify-center items-center rounded-full bg-danger self-center w-10 h-10 text-white"
        >
          <KeyIcon size={24} />
        </span>
        <span class="self-center">Log in with Private Key</span>
      </button>
      <button
        on:click={() => (seedModal = true)}
        class="flex w-[320px] h-[52px] gap-2 shadow rounded-xl justify-center text-center font-semibold border box-border border-[#D1D3DC]"
      >
        <span
          class="flex justify-center items-center rounded-full bg-green-500 self-center w-10 h-10 text-white"
        >
          <SeedIcon size={24} />
        </span>
        <span class="self-center">Restore from seed</span>
      </button>
    </div>
  </div>
  <div class="flex flex-col font-semibold gap-3">
    Don't have an account?
    <a href="/onboarding">
      <Button class="self-center" primary={false}>Sign up</Button>
    </a>
  </div>
</div>
