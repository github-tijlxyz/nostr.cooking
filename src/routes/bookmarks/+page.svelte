<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent, type NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { formatDate } from '$lib/utils';

  let loaded = false;
  let event: NDKEvent;
  let events: NDKEvent[] = [];
  let user: NDKUserProfile;
  let tried = 0;
  let naddr = '...';

  async function loadData() {
    loaded = false;

    if (!$userPublickey) {
      goto('/login');
      return;
    } else {
      naddr = nip19.naddrEncode({
        identifier: 'nostrcooking-bookmarks',
        pubkey: $userPublickey,
        kind: 30001
      });
    }

    // load user
    const u = await $ndk.getUser({ hexpubkey: $userPublickey }).fetchProfile();
    if (u) {
      user = u;
    }

    // load event
    let e = await $ndk.fetchEvent({
      // @ts-ignore
      '#d': ['nostrcooking-bookmarks'],
      // @ts-ignore
      authors: [$userPublickey],
      kinds: [30001]
    });
    if (e) {
      event = e;
    } else {
      try {
        const event = new NDKEvent($ndk);
        event.kind = 30001;
        event.tags.push(['d', 'nostrcooking-bookmarks']);
        event.tags.push(['title', 'Nostr Cooking Bookmarks']);
        let relays = await event.publish();
        relays.forEach((relay) => {
          relay.once('published', () => {
            console.log('published to', relay);
          });
          relay.once('publish:failed', (relay, err) => {
            console.log('publish failed to', relay, err);
          });
        });
        setTimeout(() => {
          tried++;
          loadData();
        }, 250);
      } catch (err) {
        alert('error: ' + err);
      }
    }

    // load list
    if (event) {
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
    }

    loaded = true;
  }

  onMount(() => {
    loadData();
  });
</script>

{#if event}
  <div class="mb-6 prose">
    {#if user}
      <h1 class="mb-0">
        {user.name}'s bookmarks
      </h1>
      <p>
        {#if $userPublickey == event.author.hexpubkey}
          <a class="underline" href={`/bookmarks/edit`}>Edit</a>
        {/if}
        &nbsp;•&nbsp; updated on {event.created_at && formatDate(event.created_at)}
      </p>
    {/if}
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
