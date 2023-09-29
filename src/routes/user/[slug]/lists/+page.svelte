<script lang="ts">
  import { page } from '$app/stores';
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent, NDKFilter, NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { formatDate } from '$lib/utils';
  import TotalZaps from '../../../../components/TotalZaps.svelte';

  let hexpubkey: string | undefined = undefined;
  let events: NDKEvent[] = [];
  let user: NDKUserProfile;
  let loaded = false;

  if ($page.params.slug.startsWith(`npub1`)) {
    hexpubkey = nip19.decode($page.params.slug).data.toString();
  } else {
    goto(`/r/user/${nip19.npubEncode($page.params.slug)}`);
  }

  onMount(async () => {
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
        kinds: [30001],
        '#t': ['nostrcooking']
      };
      const evts = await $ndk.fetchEvents(filter);
      let evtsArr = Array.from(evts);
      events = evtsArr;

      loaded = true;
    }
  });
</script>

<div class="prose mb-6">
  <h1>
    <a class="underline" href="nostr:{$page.params.slug}"
      >{#if user && user.name}{user.name}{:else}...{/if}</a
    >'s Lists
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
          <span aria-hidden="true" class="bg-transparent absolute inset-x-0 bottom-0 h-0.5" />
        </a>

        <a
          href={`/user/${nip19.npubEncode(hexpubkey)}/lists`}
          class="text-gray-500 hover:text-gray-700 group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
        >
          <span>Lists</span>
          <span aria-hidden="true" class="bg-blue-500 absolute inset-x-0 bottom-0 h-0.5" />
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
      href="/list/create"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
    >
      <div class="w-full text-center">Create New List</div>
    </a>
  </div>
{/if}

{#if events.length > 0}
  {#each events as event}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click={() =>
        goto(
          `/list/${nip19.naddrEncode({
            // @ts-ignore
            identifier: event.tags.find((t) => t[0] == 'd')?.[1],
            // @ts-ignore
            kind: event.kind,
            pubkey: event.pubkey
          })}`
        )}
      class="rounded-lg h-[320px] cursor-pointer mb-2 border border-slate-500 transition relative overflow-hidden hover:bg-slate-100 {event.tags.find(
        (e) => e[0] == 'image'
      )?.[0]
        ? 'bg-cover text-white'
        : 'bg-slate-50'}"
      style={`${
        event.tags.find((e) => e[0] == 'image')?.[0] &&
        `background-image: url('${event.tags.find((e) => e[0] == 'image')?.[1]}');`
      }`}
    >
      <div class="p-6 relative">
        <h5 class="text-3xl font-medium leading-tight">
          {event.tags.find((t) => t[0] == 'title')?.[1]}
        </h5>
        {#if event.sig}
          <p class="text-base mb-2 mt-0">
            by {#await event.author?.fetchProfile()}...{:then result}{#if result !== null && result.name}{result.name}{:else}...{/if}{/await}
            &nbsp;•&nbsp; updated on {event.created_at && formatDate(event.created_at)}
          </p>
        {:else}
          <div class="mb-2" />
        {/if}
        {#if event?.tags.find((e) => e[0] == 'summary')?.[0] && event?.tags.find((e) => e[0] == 'summary')?.[1]}
          <p class="text-base">
            {event?.tags
              .find((e) => e[0] == 'summary')?.[1]
              .slice(
                0,
                192
              )}{#if String(event.tags.find((e) => e[0] == 'summary')?.[1])?.length > 192}...{/if}
          </p>
        {:else}
          <p class="text-base">no summary ...</p>
        {/if}
      </div>
    </div>
  {/each}
{:else if loaded == false}
  <p>loading</p>
{:else}
  <p>Nothing found here :(</p>
{/if}
