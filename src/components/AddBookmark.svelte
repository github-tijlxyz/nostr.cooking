<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';

  export let event: NDKEvent;
  let show = false;
  let bookmarkEvent: NDKEvent;

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
      if (!bookmarkEvent.tags.find(t => t[0] == 'a' && t[1] == `${event.kind}:${event.author.hexpubkey}:${event.tags.find((t) => t[0] == 'd')?.[1]}`)) {
        show = true;
      }
    }
  });

  async function addBookMark() {
    if (event && bookmarkEvent && event.author.hexpubkey && bookmarkEvent.sig) {
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
      });
      show = false;
    }
  }
</script>

{#if show}
&nbsp;•&nbsp; <a class="underline cursor-pointer" on:click={addBookMark}>add bookmark</a>
{/if}