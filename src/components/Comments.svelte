<script lang="ts">
  import { ndk } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import { nip19 } from 'nostr-tools';
  import Button from './Button.svelte';

  export let event: NDKEvent;
  let events: Set<NDKEvent> = new Set()

  onMount(async () => {
    events = await $ndk.fetchEvents({
      kinds: [1],
      '#a': [`${event.kind}:${event.author.hexpubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]
    });
  });

  let commentText = "";
  async function postComment() {
    const ev = new NDKEvent($ndk)
    ev.kind = 1
    ev.content = commentText
    ev.tags = [['a', `${event.kind}:${event.author.hexpubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]]

    await ev.publish()
  }
</script>

<div class="flex flex-col gap-6">
  <h1>Comments</h1>
  <div class="flex flex-col gap-4">
    {#if events}
      {#each events as ev, i}
        <div class="flex gap-4">
          <a href="/user/{nip19.npubEncode(ev.pubkey)}"><Avatar class="self-center rounded-full w-12 h-12" ndk={$ndk} pubkey={ev.pubkey} /></a>
          <div class="flex flex-col self-center">
            <div class="flex gap-2">
              <a href="/user/{nip19.npubEncode(ev.pubkey)}"><Name ndk={$ndk} pubkey={ev.pubkey} /></a>
              ·
              {new Date((ev.created_at || 0) * 1000).toLocaleDateString()}
            </div>
            <p class="text-wrap">
              {ev.content}
            </p>
          </div>
        </div>
        {#if Array.from(events)[i+1]}
          <hr />
        {/if}
      {/each}
    {:else}
      Loading...
    {/if}
  </div>
  <h2>Reply</h2>
  <textarea bind:value={commentText} class="rounded-3xl border-none bg-input" rows="6" placeholder="This tastes..."></textarea>
  <Button on:click={postComment} class="self-end">Post Reply</Button>
</div>
