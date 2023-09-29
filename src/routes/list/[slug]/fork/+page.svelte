<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ndk } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import StringComboBox from '../../../../components/StringComboBox.svelte';
  import { writable, type Writable } from 'svelte/store';
  import ListComboBox from '../../../../components/ListComboBox.svelte';

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  let title = '';
  let image = '';
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

  let disablePublishButton = false;

  async function createList() {
    disablePublishButton = true;
    try {
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      nevent.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
      nevent.tags.push(['title', title]);
      nevent.tags.push(['t', 'nostrcooking']);
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

{#if loaded == false}
  <div>Loading...</div>
{:else}
  <form on:submit|preventDefault={createList} class="space-y-8 m-2 divide-y divide-gray-200">
    <div class="space-y-8 divide-y divide-gray-200">
      <div>
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Title*</h3>
        </div>

        <div class="sm:col-span-6">
          <div class="mt-1">
            <input
              disabled={true}
              bind:value={title}
              placeholder="My List, e.g. 'good recipies for weekdays'"
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="pt-8">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">Image</h3>
            <p class="mt-1 text-sm text-gray-500">
              Optional. you can upload a file and get a link on <a
                class="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://nostr.build">nostr.build</a
              >
            </p>
          </div>

          <div class="sm:col-span-6">
            <div class="mt-1">
              <input
                placeholder="https://example.com/image.png"
                bind:value={image}
                class="shadow-sm mt-3 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div class="pt-8">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">Summary</h3>
              <p class="mt-1 text-sm text-gray-500">
                Optional. Show's up in lists, at recent recipies or profile page
              </p>
            </div>

            <div class="sm:col-span-6">
              <div class="mt-1">
                <textarea
                  placeholder="What is this list about?"
                  bind:value={summary}
                  rows="3"
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="pt-8">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">Items</h3>
            <p class="mt-1 text-sm text-gray-500">Items in this list</p>
          </div>

          <div class="sm:col-span-6">
            <div class="mt-1">
              <ListComboBox placeholder="naddr1..." selected={items} />
            </div>
          </div>
        </div>

        <div class="pt-5">Warning: Anyone can view this list!</div>

        <div class="pt-2">
          <div class="columns-2">
            <div>
              {resultMessage}
              <button />
            </div>
            <div class="flex justify-end">
              <button
                disabled={disablePublishButton == true}
                type="submit"
                class="disabled inline-flex disabled:border-gray-300 items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-black bg-blue-50 disabled:bg-gray-50 disabled:hover:bg-gray-100 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-gray-300 focus:ring-blue-300"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
{/if}
