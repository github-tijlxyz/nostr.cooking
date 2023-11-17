<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent, NDKFilter, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import Feed from '../../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data;
  let hexpubkey: string | undefined = undefined;
  let events: NDKEvent[] = [];
  let user: NDKUserProfile;
  let loaded = false;

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  async function loadData() {
    events = [];
    user = {};
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
      const u = await $ndk.getUser({ hexpubkey: hexpubkey }).fetchProfile();
      if (u) {
        user = u;
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
</script>

<svelte:head>
  <title>{user && user.name ? user.name : '...'} on nostr.cooking</title>
</svelte:head>

<div class="prose mb-6">
  <h1>
    <a class="underline" href="nostr:{$page.params.slug}"
      >{#if user && user.name}{user.name}{:else}...{/if}</a
    >'s Recipes
  </h1>
</div>

{#if hexpubkey}
  <div class="mb-6">
    <div class="block">
      <nav class="relative z-0 rounded-lg shadow flex divide-x divide-gray-200" aria-label="Tabs">
        <a
          href={`/user/${nip19.npubEncode(hexpubkey)}`}
          class="text-gray-900 rounded-l-lg group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
          aria-current="page"
        >
          <span>Recipes</span>
          <span aria-hidden="true" class="bg-blue-300 absolute inset-x-0 bottom-0 h-0.5" />
        </a>

        <a
          href={`/user/${nip19.npubEncode(hexpubkey)}/lists`}
          class="text-gray-500 rounded-r-lg hover:text-gray-700 group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
        >
          <span>Lists</span>
          <span aria-hidden="true" class="bg-transparent absolute inset-x-0 bottom-0 h-0.5" />
        </a>
      </nav>
    </div>
  </div>
{:else}
  <div>...</div>
{/if}

{#if $userPublickey == hexpubkey}
  <div class="mb-4">
    <a
      href="/create"
      class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-black bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 w-full"
    >
      <div class="w-full text-center">Create New Recipe</div>
    </a>
  </div>
{/if}

{#if events.length > 0}
  <Feed {events} />
{:else if loaded == false}
  <p>loading</p>
{:else}
  <p>Nothing found here :(</p>
{/if}
