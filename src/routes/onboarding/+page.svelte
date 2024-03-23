<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPublicKey, nip06, nip19 } from 'nostr-tools';
  import ImageUploader from '../../components/ImageUploader.svelte';
  import { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { browser } from '$app/environment';
  import { ndk, userPublickey } from '$lib/nostr';
  import { onMount } from 'svelte';
  import Button from '../../components/Button.svelte';
  import { Fetch } from 'hurdak';

  let step = 0;
  let seed = '';
  let privateKey = '';
  //let nsec = "";
  let npub = '';

  let disableStepButtons = false;
  let name = '';
  let picture = 'https://zap.cooking/default-pfp.jpg';
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
      metaEvent.content = JSON.stringify({ displayName: name, picture });
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
      goto('/login');
    }
    step--;
    disableStepButtons = false;
  }

  onMount(async () => {
    seed = nip06.generateSeedWords();
  });

  let input: HTMLElement, listener;

  $: {
    if (input) {
      input.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        console.log('attempted');
        if (target.files && target.files?.length > 0) {
          const body = new FormData();
          body.append('file[]', target.files[0]);
          const result = await uploadToNostrBuild(body);
          console.log(result);
          if (result && result.data && result.data[0].url) {
            picture = result.data[0].url;
          }
        }
      });
    }
  }

  export async function uploadToNostrBuild(body: any) {
    const url = 'https://nostr.build/api/v2/upload/profile';
    const template = new NDKEvent($ndk);
    template.kind = 27235;
    template.content = '';
    template.tags = [
      ['u', url],
      ['method', 'POST']
    ];

    template.sign();

    return Fetch.fetchJson(url, {
      body,
      method: 'POST',
      headers: {
        Authorization: `Nostr ${btoa(JSON.stringify(event))}`
      }
    });
  }
</script>

<!-- TODO -->

<svelte:head>
  <title>welcome to nostr.cooking</title>
</svelte:head>

<div class="prose flex flex-col text-black mb-4 mx-auto">
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
      > 12 seed words ("seed pharse"). These seed words serve as your private key; which will serve as
      your permanent password for the nostr network; It's crucial to store them in a secure location
      and avoid sharing them with anyone.
    </p>
    <input bind:value={seed} type="text" disabled class="input w-full" />
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
    <input bind:value={npub} type="text" disabled class="input w-full" />
    <p>
      Regarding your profile, we need your input to create it. Please provide the following details
      for publication.
    </p>
    <div class="flex gap-4 md:gap-10 mx-auto">
      <div class="flex flex-col self-center">
        <h2 class="text-white">Picture</h2>
        <label for="file-upload" class="cursor-pointer self-center">
          <img
            class="w-[100px] h-[100px] md:w-[200px] md:h-[200px] rounded-full bg-input self-center"
            src={picture}
            alt="Profile"
          />
          <input id="file-upload" bind:this={input} type="file" class="sr-only self-center" />
        </label>
      </div>
      <div class="flex flex-col gap-2 self-center">
        <h2>Display Name</h2>
        <p class="break-words hidden md:visible">This will be visible to others.</p>
        <input bind:value={name} class="input" type="text" placeholder="Zap Cooking Chef" />
      </div>
    </div>
  {:else}
    <p>Okay, now you are ready to explore Nostr.</p>
  {/if}

  <div class="flex mb-4">
    <div class="flex-1">
      <Button on:click={backstep} disabled={disableStepButtons} primary={false}>Back</Button>
    </div>
    <div>
      <Button on:click={continuestep} disabled={disableStepButtons || (step == 2 && name == '')}>
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
          Go to zap.cooking!
        {:else}
          Continue
        {/if}
      </Button>
    </div>
  </div>
</div>
