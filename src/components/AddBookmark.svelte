<script lang="ts">
  import { goto } from '$app/navigation';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import { Bookmark, BookmarkX, Loader2 } from 'lucide-svelte';

  export let event: NDKEvent;
  let show = false;
  let removeBookmarkShow = false;
  let bookmarkEvent: NDKEvent;
  export let close: () => void;

  onMount(async () => {
    console.log(event);

    // load event
    let e = await $ndk.fetchEvent({
      // @ts-ignore
      '#d': ['nostrcooking-bookmarks'],
      // @ts-ignore
      authors: [$userPublickey],
      kinds: [30001]
    });
    if (e) {
      bookmarkEvent = e;
      if (
        !bookmarkEvent.tags.find(
          (t) =>
            t[0] == 'a' &&
            t[1] ==
              `${event.kind}:${event.author.hexpubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
        )
      ) {
        show = true;
      } else {
        removeBookmarkShow = true;
      }
    } else {
      show = true;
    }
  });

  async function removeBookmark() {
    // load event
    let e = await $ndk.fetchEvent({
      // @ts-ignore
      '#d': ['nostrcooking-bookmarks'],
      // @ts-ignore
      authors: [$userPublickey],
      kinds: [30001]
    });
    if (e) {
      bookmarkEvent = e;
      if (
        !bookmarkEvent.tags.find(
          (t) =>
            t[0] == 'a' &&
            t[1] ==
              `${event.kind}:${event.author.hexpubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
        )
      ) {
        removeBookmarkShow = false;
        return;
      }
    }

    if (event && bookmarkEvent && event.author.hexpubkey && bookmarkEvent.sig) {
      removeBookmarkShow = false;
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      bookmarkEvent.tags.forEach((t) => {
        if (
          t[0] == 'a' &&
          t[1] ==
            `${event.kind}:${event.author.hexpubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
        ) {
        } else {
          nevent.tags.push(t);
        }
      });
      let relays = await nevent.publish();
      relays.forEach((relay) => {
        relay.once('published', () => {
          console.log('published to', relay);
        });
        relay.once('publish:failed', (relay, err) => {
          console.log('publish failed to', relay, err);
        });
        close();
      });
    }
  }

  async function addBookMark() {
    // load event
    let e = await $ndk.fetchEvent({
      // @ts-ignore
      '#d': ['nostrcooking-bookmarks'],
      // @ts-ignore
      authors: [$userPublickey],
      kinds: [30001]
    });
    if (e) {
      bookmarkEvent = e;
      if (
        bookmarkEvent.tags.find(
          (t) =>
            t[0] == 'a' &&
            t[1] ==
              `${event.kind}:${event.author.hexpubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
        )
      ) {
        show = false;
        return;
      }
    }

    if (event && bookmarkEvent && event.author.hexpubkey && bookmarkEvent.sig) {
      show = false;
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      nevent.tags = bookmarkEvent.tags;
      nevent.tags.push([
        'a',
        `${event.kind}:${event.author.hexpubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
      ]);
      let relays = await nevent.publish();
      relays.forEach((relay) => {
        relay.once('published', () => {
          console.log('published to', relay);
        });
        relay.once('publish:failed', (relay, err) => {
          console.log('publish failed to', relay, err);
        });
        close();
      });
    } else if (event && event.author.hexpubkey) {
      // needs to init bookmark event, for now, go to /bookmarks to do that
      goto('/bookmarks');
    }
  }
</script>

{#if show == true}
<DropdownMenu.Item on:click={() => {addBookMark()}}>
<Bookmark class="mr-2 h-4 w-4" />
<span>Add Bookmark</span>
</DropdownMenu.Item>
{:else if removeBookmarkShow == true}
<DropdownMenu.Item on:click={() => {removeBookmark()}}>
<BookmarkX class="mr-2 h-4 w-4" />
<span>Remove Bookmark</span>
</DropdownMenu.Item>
{:else}
<DropdownMenu.Item disabled={true}>
<Loader2 class="mr-2 h-4 w-4 animate-spin" />
<span>Loading...</span>
</DropdownMenu.Item>
{/if}

<!--
{#if show == true}
  <button
    on:click={() => {
      addBookMark();
    }}
    class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
    ><span

      Add Bookmark</span
    ></button
  >
{:else if removeBookmarkShow == true}
  <button
    on:click={() => {
      removeBookmark();
    }}
    class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
    ><span


      Remove Bookmark</span
    ></button
  >
{:else}
  <button
    class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
    ><span>Updating Bookmarks...</span></button
  >
{/if}
-->

