<script lang="ts">
  import { goto } from '$app/navigation';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';

  export let event: NDKEvent;
  let show = false;
  let removeBookmarkShow = false;
  let bookmarkEvent: NDKEvent;
  export let close: () => void;

  onMount(async () => {
    console.log(event);

    // load event
    let e = await $ndk.fetchEvent({
      '#d': ['nostrcooking-bookmarks'],
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
              `${event.kind}:${event.author.pubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
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
      '#d': ['nostrcooking-bookmarks'],
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
              `${event.kind}:${event.author.pubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
        )
      ) {
        removeBookmarkShow = false;
        return;
      }
    }

    if (event && bookmarkEvent && event.author.pubkey && bookmarkEvent.sig) {
      removeBookmarkShow = false;
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      bookmarkEvent.tags.forEach((t) => {
        if (
          t[0] == 'a' &&
          t[1] == `${event.kind}:${event.author.pubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
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
      '#d': ['nostrcooking-bookmarks'],
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
              `${event.kind}:${event.author.pubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
        )
      ) {
        show = false;
        return;
      }
    }

    if (event && bookmarkEvent && event.author.pubkey && bookmarkEvent.sig) {
      show = false;
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      nevent.tags = bookmarkEvent.tags;
      nevent.tags.push([
        'a',
        `${event.kind}:${event.author.pubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`
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
    } else if (event && event.author.pubkey) {
      // needs to init bookmark event, for now, go to /bookmarks to do that
      goto('/bookmarks');
    }
  }
</script>

{#if show == true}
  <button
    on:click={() => {
      addBookMark();
    }}
    class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
    ><span
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 inline text-center mr-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
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
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 inline text-center mr-1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5"
        />
      </svg>

      Remove Bookmark</span
    ></button
  >
{:else}
  <button
    class="text-gray-700 w-full text-left hover:bg-gray-100 hover:text-gray-900 block px-4 py-2"
    ><span>Updating Bookmarks...</span></button
  >
{/if}
