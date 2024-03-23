<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { ndk } from '$lib/nostr';
  import { format as formatDate } from 'timeago.js';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import Button from './Button.svelte';

  export let replies: NDKEvent[] = [];
  export let event: NDKEvent;
  export let refresh: () => void;

  let replyText = '';

  let showReplyBox = false;

  async function postComment() {
    const ev = new NDKEvent($ndk);
    ev.kind = 1;
    ev.content = replyText;
    ev.tags = [
      ['a', event!.getMatchingTags('a')[0][1]],
      ['e', event!.id, '', 'reply'],
      ...event!.getMatchingTags('e')
    ];

    await ev.publish();
    refresh();
  }
</script>

<div id="comments" class="flex gap-4 break-all">
  <a class="flex flex-shrink-0" href="/user/{nip19.npubEncode(event.pubkey)}"
    ><Avatar class="rounded-full w-12 h-12" ndk={$ndk} pubkey={event.pubkey} /></a
  >
  <div class="flex flex-col self-center">
    <div class="flex gap-2">
      <a href="/user/{nip19.npubEncode(event.pubkey)}"><Name ndk={$ndk} pubkey={event.pubkey} /></a>
      <div class="text-gray-500">{formatDate(new Date((event.created_at || 0) * 1000))}</div>
    </div>
    <div class="flex flex-col gap-3">
      <p class="text-wrap">
        {event.content}
      </p>
      <button
        on:click={() => (showReplyBox = !showReplyBox)}
        class="text-gray-500 cursor-pointer self-start"
      >
        Reply
      </button>
      {#if showReplyBox}
        <textarea
          bind:value={replyText}
          class="bg-input border-input focus:ring-primary focus:border-primary rounded-3xl px-8 py-6 transition duration-300"
          rows="2"
          placeholder="This tastes..."
        />
        <Button on:click={postComment} class="self-end">Post Reply</Button>
      {/if}
    </div>
  </div>
</div>

<ul>
  {#each replies.filter((e) => e.getMatchingTags('e').length === event.getMatchingTags('e').length + 1) as re}
    <li>
      <svelte:self
        replies={replies.filter((e) => e.getMatchingTags('e').find((v) => v[1] === re.id))}
        event={re}
        {refresh}
      />
    </li>
  {/each}
</ul>

<style>
  ul {
    /* user-agent styles */
    display: block;
    list-style-type: none;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-inline-start: 40px;
  }
  li {
    display: list-item;
    text-align: match-parent;
  }
</style>
