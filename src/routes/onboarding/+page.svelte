<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPublicKey, nip06, nip19 } from 'nostr-tools';
  import ImageUploader from '../../components/ImageUploader.svelte';
  import { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { browser } from '$app/environment';
  import { ndk, userPublickey } from '$lib/nostr';
  import { onMount } from 'svelte';

  let step = 0;
  let seed = '';
  let privateKey = '';
  //let nsec = "";
  let npub = '';

  let disableStepButtons = false;
  let name = '';
  let picture = '';
  let about = '';

  if ($userPublickey !== '') {
    goto('/settings');
  }

  async function loginWithPrivateKey(privateKey: string) {
    if (browser && privateKey) {
      let pk = privateKey;
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
    }
  }

  async function continuestep() {
    disableStepButtons = true;
    if (step == 1) {
      privateKey = nip06.privateKeyFromSeedWords(seed);
      npub = nip19.npubEncode(getPublicKey(privateKey));
      await loginWithPrivateKey(privateKey);
    }
    if (step == 2 && name !== '') {
      const metaEvent = new NDKEvent($ndk);
      metaEvent.kind = 0;
      metaEvent.tags = [];
      metaEvent.content = JSON.stringify({ name, picture, about });
      let relays = await metaEvent.publish();
      relays.forEach((relay) => {
        relay.once('published', () => {
          console.log('published to', relay);
        });
        relay.once('publish:failed', (relay, err) => {
          console.log('publish failed to', relay, err);
        });
      });
    }
    if (step == 3) {
      goto('/');
    }
    step++;
    disableStepButtons = false;
  }

  function backstep() {
    disableStepButtons = true;
    if (step == 0) {
      goto('/settings');
    }
    step--;
    disableStepButtons = false;
  }

  onMount(async () => {
    seed = nip06.generateSeedWords();
  });
</script>

<!-- TODO -->

<svelte:head>
  <title>welcome to nostr.cooking</title>
</svelte:head>

<div class="prose mb-4">
  <h1>Welcome</h1>
  {#if step == 0}
    <p>
      Welcome to Nostr (Notes and Other Stuff Transmitted by Relays). Nostr is a decentralized,
      'uncensorable' social protocol. Built on top of Nostr, there are various clients/apps,
      including Twitter-like clients, Blog clients, and more, all tied to the same identity, secured
      through cryptography.
    </p>
    <p>For more information, please visit:</p>
    <ul>
      <li><a target="_blank" rel="noopener noreferrer" href="https://nostr.com">nostr.com</a></li>
      <li><a target="_blank" rel="noopener noreferrer" href="https://nostr.how">nostr.how</a></li>
    </ul>
    <p>
      Here, you can securely <button
        class="inline underline"
        on:click={() => (seed = nip06.generateSeedWords())}>generate</button
      > 12 seed words ("seed pharse"). These seed words serve as your private key; which will
      serve as your permanent password for the nostr network; It's crucial to store them in a
      secure location and avoid sharing them with anyone.
    </p>
    <div class="mt-1 bg-white rounded-md shadow-sm -space-y-px">
      <div>
        <input
          bind:value={seed}
          type="text"
          disabled
          class="focus:ring-indigo-500 focus:border-indigo-500 relative block w-full rounded-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
        />
      </div>
    </div>
    <p>
      While generating a seed on the web is convenient, it may not be the most secure option.
      Consider downloading a native Nostr client for a more robust and secure experience.
    </p>
  {:else if step == 1}
    <p>Please only continue if you saved your seed pharse.</p>
  {:else if step == 2}
    <p>
      Your public key, often referred to as npub, can be shared with anyone. With this public key,
      others can discover your profile and posts.
    </p>
    <div class="mt-1 bg-white rounded-md shadow-sm -space-y-px">
      <div>
        <input
          bind:value={npub}
          type="text"
          disabled
          class="focus:ring-indigo-500 focus:border-indigo-500 relative block w-full rounded-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
        />
      </div>
    </div>
    <p>
      Regarding your profile, we need your input to create it. Please provide the following details
      for publication.
    </p>
    <div class="">
      <div>
        <input
          type="text"
          bind:value={name}
          class="focus:ring-indigo-500 focus:border-indigo-500 relative block w-full rounded-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
          placeholder="Username"
        />
      </div>
      <div>
        <ImageUploader name="Profile Picture" setUrl={(u) => (picture = u)} />
      </div>
      <div class="mt-2">
        <textarea
          bind:value={about}
          class="focus:ring-indigo-500 focus:border-indigo-500 relative block w-full rounded-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
          cols="10"
          rows="4"
          placeholder="About"
        />
      </div>
    </div>
  {:else}
    <p>Okay, now you are ready to explore Nostr.</p>
  {/if}
</div>

<div class="flex mb-4">
  <div class="flex-1">
    <button
      on:click={backstep}
      disabled={disableStepButtons}
      class="disabled:border-transparent disabled:bg-gray-50 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:text-gray-500"
    >
      Back
    </button>
  </div>
  <div>
    <button
      on:click={continuestep}
      disabled={disableStepButtons || (step == 2 && name == '')}
      class="inline-flex items-center px-4 py-2 text-sm border border-transparent font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
    >
      {#if disableStepButtons == true}
        loading...
      {:else if step == 0}
        Continue with this seed
      {:else if step == 1}
        I saved the seed pharse
      {:else if step == 2}
        {#if name == ''}
          please enter a username
        {:else}
          Publish Profile
        {/if}
      {:else if step == 3}
        Go to nostr.cooking!
      {:else}
        Continue
      {/if}
    </button>
  </div>
</div>
