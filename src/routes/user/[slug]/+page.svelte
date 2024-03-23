<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from "@nostr-dev-kit/ndk"
  import type { NDKFilter, NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import ZapModal from '../../../components/ZapModal.svelte';
  import Feed from '../../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import Button from '../../../components/Button.svelte';
  import LightningIcon from 'phosphor-svelte/lib/Lightning';
  import QrIcon from 'phosphor-svelte/lib/QrCode';
  import { requestProvider } from 'webln';
  import ProfileLists from '../../../components/ProfileLists.svelte';
  import Modal from '../../../components/Modal.svelte';
  // @ts-expect-error ehm svelte-qrcode doesn't have type support or something?
  import QrCode from 'svelte-qrcode';
  import { Fetch } from 'hurdak';

  let hexpubkey: string | undefined = undefined;
  let events: NDKEvent[] = [];
  let user: NDKUser;
  let profile: NDKUserProfile;
  let loaded = false;
  let zapModal = false;
  let recipesTab = true;

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  async function loadData() {
    events = [];
    profile = {};
    hexpubkey = undefined;
    loaded = false;
    console.log('loadData');
    if ($page.params.slug.startsWith(`npub1`)) {
      hexpubkey = nip19.decode($page.params.slug).data.toString();
    } else {
      goto(`/user/${nip19.npubEncode($page.params.slug)}`);
    }
    if (hexpubkey) {
      // load user
      const u = $ndk.getUser({ pubkey: hexpubkey });
      const p = await u.fetchProfile();
      user = u;
      if (p) {
        profile = p;
      }

      // load feed
      let filter: NDKFilter = {
        authors: [hexpubkey],
        limit: 256,
        kinds: [30023],
        '#t': ['nostrcooking']
      };
      const evts = await $ndk.fetchEvents(filter);
      let evtsArr = Array.from(evts);
      evtsArr.forEach((ev, i) => {
        if (validateMarkdownTemplate(ev.content) == null) {
          evtsArr.splice(i, 1);
        }
      });
      events = evtsArr;

      loaded = true;
    }
    profileName = profile && profile.displayName ? profile.displayName : ""
    url = profile && profile.image ? profile.image : ""
  }

  async function zapEvt(amount: number, message: string) {
    zapModal = false;
    if (amount) {
      const a = await user.zap(amount * 1000, message);
      if (a) {
        try {
          const webln = await requestProvider();
          await webln.sendPayment(a);
        } catch (err) {
          console.log('error while handleing zap', err);
        }
      }
    }
  }

  let qrModal = false;

  function qrModalCleanup() {
    qrModal = false;
  }

  let editModal = false;

  function editModalCleanup() {
    editModal = false;
  }

  let input: HTMLElement, listener;
  let url = '';

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
            url = result.data[0].url;
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

  let profileName = ""
  async function updateProfile() {
    const metaEvent = new NDKEvent($ndk);
    metaEvent.kind = 0;
    metaEvent.tags = [];
    // @ts-expect-error typescript is wrong
    profile = user.profile
    if (!profile) profile = {}
    profile.image = url;
    profile.displayName = profileName;
    console.log(profile)

    try {
      console.log(hexpubkey, profile)
      $ndk.cacheAdapter!.saveProfile!(hexpubkey!, profile) // for some reason the caching doesn't happen automatically
      metaEvent.content = JSON.stringify(profile);
      let relays = await metaEvent.publish();
      relays.forEach((relay) => {
        relay.once('published', () => {
          console.log('published to', relay);
        });
        relay.once('publish:failed', (relay, err) => {
          console.log('publish failed to', relay, err);
        });
      });
    } catch (error) {
      console.error("error while publishing update: ", error)
    }
    editModalCleanup();
  }
</script>

<svelte:head>
  <title>{profile && profile.name ? profile.name : '...'} on nostr.cooking</title>
</svelte:head>

<ZapModal open={zapModal} submit={zapEvt} cancel={() => (zapModal = false)} />

<Modal cleanup={editModalCleanup} open={editModal}>
  <h1 slot="title">Edit Profile</h1>
  <div class="flex gap-4 md:gap-10 mx-auto">
    <div class="flex flex-col self-center">
      <h2 class="text-white">Picture</h2>
      <label for="file-upload" class="cursor-pointer self-center">
        <img class="w-[100px] h-[100px] md:w-[200px] md:h-[200px] rounded-full bg-input self-center" src={url} alt="Profile" />
        <input id="file-upload" bind:this={input} type="file" class="sr-only self-center" />
      </label>
    </div>
    <div class="flex flex-col gap-2 self-center">
      <h2>Display Name</h2>
      <p class="break-words hidden md:visible">This will be visible to others.</p>
      <input bind:value={profileName} class="input" type="text" placeholder="Zap Cooking Chef" />
    </div>
  </div>
  <div class="flex gap-2 justify-end">
    <Button
      class="!text-black bg-white border border-[#ECECEC] hover:bg-accent-gray"
      on:click={editModalCleanup}>Cancel</Button
    >
    <Button on:click={updateProfile}>Save</Button>
  </div>
</Modal>

<Modal cleanup={qrModalCleanup} open={qrModal}>
  <h1 slot="title">{profile && profile.name ? profile.name : '...'}'s QR Code</h1>
  Scan this on your mobile device to see their profile!
  <div>
    <QrCode value="nostr:{nip19.nprofileEncode({ pubkey: user.pubkey, relays: user.relayUrls })}" />
  </div>
</Modal>

<div class="flex flex-col gap-6">
  <div class="flex gap-16 md:gap-20">
    <div class="flex gap-4">
      <Avatar
        class="cursor-pointer w-[100px] h-[100px] object-center rounded-full self-center hidden md:flex"
        ndk={$ndk}
        pubkey={hexpubkey}
      />
      <h1 class="self-center"><Name ndk={$ndk} pubkey={hexpubkey} npubMaxLength={10} /></h1>
    </div>
    <div class="flex gap-2 self-center">
      <Button
        class="flex self-center !bg-accent-gray !text-[#675F5F] !px-3"
        on:click={() => (qrModal = true)}><QrIcon /></Button
      >
      {#if hexpubkey !== $userPublickey}
        <Button
          class="flex self-center !bg-accent-gray !text-[#675F5F] !px-3"
          on:click={() => (zapModal = true)}><LightningIcon /></Button
        >
        <!-- <Button class="flex self-center">Follow</Button> -->
      {/if}
      {#if hexpubkey === $userPublickey}
        <Button
          class="flex self-center"
          primary="false"
          on:click={() => (editModal = true)}>Edit Profile</Button
        >
      {/if}
    </div>
  </div>

  <hr />

  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <button
        class="rounded-full px-4 py-2 font-semibold cursor-pointer bg-accent-gray {recipesTab
          ? ''
          : 'opacity-70'}"
        on:click={() => (recipesTab = true)}
      >
        Recipes
      </button>
      <button
        class="rounded-full px-4 py-2 font-semibold bg-accent-gray cursor-pointer {recipesTab
          ? 'opacity-70'
          : ''}"
        on:click={() => (recipesTab = false)}
      >
        Lists
      </button>
    </div>

    {#if recipesTab}
      <h2>
        <Name ndk={$ndk} pubkey={hexpubkey} npubMaxLength={10} />'s Recipes
      </h2>
      {#if events.length > 0}
        <Feed {events} />
      {:else if loaded === false}
        <p>loading</p>
      {:else}
        <p>Nothing found here :(</p>
      {/if}
    {:else}
      <h2>
        <Name ndk={$ndk} pubkey={hexpubkey} npubMaxLength={10} />'s Lists
      </h2>
      <ProfileLists {hexpubkey} />
    {/if}
  </div>
</div>
