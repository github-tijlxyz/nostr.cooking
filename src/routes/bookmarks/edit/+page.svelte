<script lang="ts">
  import { goto } from '$app/navigation';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import ListComboBox from '../../../components/ListComboBox.svelte';
  import Button from '../../../components/Button.svelte';
  import ImagesComboBox from '../../../components/ImagesComboBox.svelte';

  let title = '';
  let image = '';
  let summary = '';
  let resultMessage = '';

  onMount(() => {
    if ($userPublickey == '') goto('/login');
  });

  type Atype = {
    title?: string;
    naddr: string;
  };

  let loaded = false;
  let event: NDKEvent;
  let events: NDKEvent[] = [];
  let items: Writable<Atype[]> = writable([]);

  async function loadData() {
    if (!$userPublickey) {
      goto('/login');
      return;
    }
    let e = await $ndk.fetchEvent({
      // @ts-ignore
      '#d': ['nostrcooking-bookmarks'],
      // @ts-ignore
      authors: [$userPublickey],
      kinds: [30001]
    });
    if (e) {
      event = e;
    }
    if (event) {
      let ntitle = event.tags.find((t) => t[0] == 'title')?.[1];
      if (ntitle) {
        title = ntitle;
      }
      let nimage = event.tags.find((t) => t[0] == 'image')?.[1];
      if (nimage) {
        image = nimage;
      }
      let nsummary = event.tags.find((t) => t[0] == 'summary')?.[1];
      if (nsummary) {
        summary = nsummary;
      }
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
          const naddr = nip19.naddrEncode({
            kind: Number(kind),
            identifier: identifier,
            pubkey: pubkey
          });
          const newEv = await $ndk.fetchEvent({
            kinds: [Number(kind)],
            '#d': [identifier],
            authors: [pubkey]
          });
          if (newEv) {
            events.push(newEv);
            $items.push({ title: newEv.tags.find((z) => z[0] == 'title')?.[1], naddr: naddr });
            $items = $items;
            items.set($items);
          }
        }
      });
    }
    loaded = true;
  }

  onMount(() => {
    loadData();
  });

  let disablePublishButton = false;

  async function createList() {
    disablePublishButton = true;
    try {
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      nevent.tags.push(['d', 'nostrcooking-bookmarks']);
      nevent.tags.push(['title', 'Zap Cooking Bookmarks']);
      if (summary !== '') {
        nevent.tags.push(['summary', summary]);
      }
      if (image !== '') {
        nevent.tags.push(['image', image]);
      }
      $items.forEach((e) => {
        const data = nip19.decode(e.naddr).data;
        // @ts-ignore
        const newAtag = `${data.kind}:${data.pubkey}:${data.identifier}`;
        nevent.tags.push(['a', newAtag]);
      });
      console.log(nevent);
      let relays = await nevent.publish();
      relays.forEach((relay) => {
        relay.once('published', () => {
          console.log('published to', relay);
        });
        relay.once('publish:failed', (relay, err) => {
          console.log('publish failed to', relay, err);
        });
      });
      resultMessage = 'Succes!';
      let naddr = nip19.naddrEncode({
        identifier: title.toLowerCase().replaceAll(' ', '-'),
        kind: 30001,
        pubkey: nevent.pubkey
      });
      setTimeout(() => {
        goto(`/bookmarks`);
      }, 2500);
    } catch (err) {
      resultMessage = `Error: ${err}`;
    } finally {
      if (resultMessage == 'Processing...') {
        resultMessage = '';
        disablePublishButton = false;
      }
    }
  }

  items.subscribe((i) => {
    i.forEach(async (t) => {
      if (!t.title) {
        const data = nip19.decode(t.naddr).data;
        const newEv = await $ndk.fetchEvent({
          // @ts-ignore
          kinds: [Number(data.kind)],
          // @ts-ignore
          '#d': [data.identifier],
          // @ts-ignore
          authors: [data.pubkey]
        });

        if (newEv) {
          const updatedItems = i.map((item) => {
            if (item === t) {
              return { ...item, title: newEv.tags.find((z) => z[0] === 'title')?.[1] };
            }
            return item;
          });

          items.set(updatedItems);
        }
      }
    });
  });
</script>

<svelte:head>
  <title>edit bookmarks zap.cooking</title>
</svelte:head>

{#if loaded == false}
  <div class="flex justify-center items-center h-screen">
    <img class="w-64" src="/pan-animated.svg" alt="Loading" />
  </div>
{:else}
  <form on:submit|preventDefault={createList} class="flex flex-col gap-6 max-w-[760px] mx-auto">
    <h1>Edit Bookmarks</h1>
    <div>
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Recipes</h3>
        <p class="mt-1 text-sm text-gray-500">Recipes that you've bookmarked</p>
      </div>

      <div class="sm:col-span-6">
        <div class="mt-1">
          <ListComboBox showIndex={true} placeholder="naddr1..." selected={items} />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <div>
        {resultMessage}
        <button />
        <Button disabled={disablePublishButton} type="submit">Update Bookmarks</Button>
      </div>
    </div>
  </form>
{/if}
