<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import { type NDKEvent, type NDKFilter, NDKUser, type NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import ZapModal from '../../../components/ZapModal.svelte';
  import Feed from '../../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import Button from '../../../components/Button.svelte';
  import LightningIcon from "phosphor-svelte/lib/Lightning";
  import QrIcon from "phosphor-svelte/lib/QrCode";
  import { requestProvider } from 'webln';
  import ProfileLists from '../../../components/ProfileLists.svelte';

  export let data;
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
  }

  async function zapEvt(amount: number, message: string) {
    zapModal = false;
    if (amount) {
      const a = await user.zap(amount * 1000, message);
      if (a) {
        try {
          const webln = await requestProvider();
          const res = await webln.sendPayment(a);
        } catch (err) {
          console.log('error while handleing zap', err);
        }
      }
    }
  }
</script>

<svelte:head>
  <title>{profile && profile.name ? profile.name : '...'} on nostr.cooking</title>
</svelte:head>

{#if zapModal}
  <ZapModal submit={zapEvt} cancel={() => (zapModal = false)} />
{/if}

<div class="flex flex-col gap-6">
  <div class="flex gap-20">
    <div class="flex gap-4">
      <Avatar
        class="cursor-pointer w-[100px] h-[100px] object-center rounded-full self-center"
        ndk={$ndk}
        pubkey={hexpubkey}
      />
      <h1 class="self-center"><Name ndk={$ndk} pubkey={hexpubkey} /></h1>
    </div>
    <div class="flex gap-2 self-center">
      <Button class="flex self-center !bg-accent-gray !text-[#675F5F] !px-3"
        ><QrIcon /></Button
      >
      {#if hexpubkey !== $userPublickey}
      <Button
        class="flex self-center !bg-accent-gray !text-[#675F5F] !px-3"
        on:click={() => (zapModal = true)}><LightningIcon /></Button
      >
      <Button class="flex self-center">Follow</Button>
      {/if}
    </div>
  </div>

  <hr />

  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <div
        class="rounded-full px-4 py-2 font-semibold cursor-pointer bg-accent-gray {recipesTab
          ? ''
          : 'opacity-70'}"
        on:click={() => (recipesTab = true)}
      >
        Recipes
      </div>
      <div
        class="rounded-full px-4 py-2 font-semibold bg-accent-gray cursor-pointer {recipesTab
          ? 'opacity-70'
          : ''}"
        on:click={() => (recipesTab = false)}
      >
        Lists
      </div>
    </div>

    {#if recipesTab}
      <h2>
        <Name ndk={$ndk} pubkey={hexpubkey} npubMaxLength={10} />'s Recipes
      </h2>
      {#if events.length > 0}
        <Feed {events} />
      {:else if loaded == false}
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
