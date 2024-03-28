<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import StringComboBox from '../../../../components/StringComboBox.svelte';
  import { writable, type Writable } from 'svelte/store';
  import ListComboBox from '../../../../components/ListComboBox.svelte';
  import Button from '../../../../components/Button.svelte';
  import ImagesComboBox from '../../../../components/ImagesComboBox.svelte';

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  onMount(() => {
    if ($userPublickey == '') goto('/login');
  });

  let title = '';
  let images: Writable<string[]> = writable([]);
  let summary = '';
  let resultMessage = '';

  type Atype = {
    title?: string;
    naddr: string;
  };

  let loaded = false;
  let event: NDKEvent;
  let events: NDKEvent[] = [];
  let items: Writable<Atype[]> = writable([]);

  async function loadData() {
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
        goto(`/list/${c}/edit`);
      }
    }
    console.log(event);
    if (event) {
      let ntitle = event.tags.find((t) => t[0] == 'title')?.[1];
      if (ntitle) {
        title = ntitle;
      }
      let nimage = event.tags.find((t) => t[0] == 'image')?.[1];
      if (nimage) {
        $images = [nimage];
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

  let disablePublishButton = false;

  async function createList() {
    disablePublishButton = true;
    try {
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      if (!event.tags.find((t) => t[0] == 'd' && t[1] == 'nostrcooking-bookmarks')) {
        nevent.tags.push(['t', 'nostrcooking']);
        nevent.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
      } else {
        nevent.tags.push(['d', 'nostrcooking-bookmarks']);
      }
      nevent.tags.push(['title', title]);
      if (summary !== '') {
        nevent.tags.push(['summary', summary]);
      }
      if ($images.length === 1) {
        event.tags.push(['image', $images[0]]);
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
        if (nevent.tags.find((a) => a[0] == 'd')?.[1] == 'nostrcooking-bookmarks') {
          goto(`/bookmarks`);
        } else {
          goto(`/list/${naddr}`);
        }
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
  <title>fork list {loaded == true ? title : '...'} on zap.cooking</title>
</svelte:head>

{#if loaded == false}
  <div>Loading...</div>
{:else}
  <form on:submit|preventDefault={createList} class="flex flex-col gap-6 max-w-[760px] mx-auto">
    <h1>Edit List</h1>
    <div class="flex flex-col gap-2">
      <h3>Title*</h3>
      <span class="text-caption">Remember to make your title unique!</span>
      <input placeholder="Italian Favorites" bind:value={title} class="input" />
    </div>

    <div class="flex flex-col gap-2">
      <h3>Summary</h3>
      <textarea
        placeholder="A brief description of what this list is about."
        bind:value={summary}
        rows="6"
        class="input"
      />
    </div>

    <div>
      <h3>Cover Image</h3>
      <span class="text-caption">Appears on your Profile and on the List's page, optional.</span>
      <ImagesComboBox uploadedImages={images} limit={1} />
    </div>

    <div class="pt-8">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Recipes</h3>
        <p class="mt-1 text-sm text-gray-500">Recipes in this list</p>
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
        <Button disabled={disablePublishButton} type="submit">Update List</Button>
      </div>
    </div>
  </form>
{/if}
