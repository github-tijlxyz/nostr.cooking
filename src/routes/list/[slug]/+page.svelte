<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import Feed from '../../../components/Feed.svelte';
  import { formatDate } from '$lib/utils';
  import AuthorProfile from '../../../components/AuthorProfile.svelte';

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  let loaded = false;
  let event: NDKEvent;
  let events: NDKEvent[] = [];
  let user: NDKUserProfile;

  async function loadData() {
    loaded = false;
    // load event
    if ($page.params.slug.startsWith('naddr1')) {
      const b = nip19.decode($page.params.slug).data;
      let e = await $ndk.fetchEvent({
        // @ts-ignore
        '#d': [b.identifier],
        // @ts-ignore
        authors: [b.pubkey],
        kinds: [30001]
      });
      if (e) {
        event = e;
      }
    } else {
      let e = await $ndk.fetchEvent($page.params.slug);
      if (e) {
        event = e;
        const c = nip19.naddrEncode({
          // @ts-ignore
          identifier: e.tags.find((z) => z[0] == 'd')?.[1],
          // @ts-ignore
          kind: e.kind,
          pubkey: e.author.hexpubkey
        });
        goto(`/list/${c}`);
      }
    }

    // load list
    event.tags.forEach(async (a) => {
      if (a[0] == 'a') {
        const parts = a[1].split(':');
        if (parts.length !== 3) {
          return;
        }
        const [kind, pubkey, identifier] = parts;
        if (
          typeof kind !== 'string' ||
          typeof pubkey !== 'string' ||
          typeof identifier !== 'string'
        ) {
          return;
        }
        const newEv = await $ndk.fetchEvent({
          kinds: [Number(kind)],
          '#d': [identifier],
          authors: [pubkey]
        });
        if (newEv) {
          events.push(newEv);
          events = events;
        }
      }
    });

    loaded = true;
  }
</script>

<svelte:head>
  <title>{event ? event.tags.find((t) => t[0] == 'title')?.[1] : '...'} on zap.cooking</title>
</svelte:head>

{#if event}
  <div class="mb-6 prose">
    <h1 class="mb-0">
      {event.tags.find((t) => t[0] == 'title')?.[1]}
    </h1>
    <div class="flex flex-col">
      <AuthorProfile pubkey={event.author.pubkey} />
      <div class="flex gap-2">
        {#if $userPublickey == event.author.hexpubkey}
          <a class="underline" href={`/list/${$page.params.slug}/fork`}>Edit</a>
        {/if}
        Updated on {event.created_at && formatDate(event.created_at)}
      </div>
    </div>
    {#if event.tags.find((t) => t[0] == 'summary')?.[1]}
      <p>
        {event.tags.find((t) => t[0] == 'summary')?.[1]}
      </p>
    {/if}
  </div>
{:else}
  <div>...</div>
{/if}

{#if events.length > 0 && loaded == true}
  <Feed {events} />
{:else if loaded == false}
  <p>loading</p>
{:else}
  <p>Nothing found here :(</p>
{/if}
