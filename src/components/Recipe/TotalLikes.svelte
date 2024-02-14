<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Fa from 'svelte-fa';
  import { faHeart } from '@fortawesome/free-solid-svg-icons';

  export let event: NDKEvent;
  let loading = true;
  let totalLikeAmount: number = 0;
  let liked = false;

  onMount(async () => {
    const evs = await $ndk.fetchEvents({
      kinds: [7],
      '#a': [`${event.kind}:${event.author.hexpubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]
    });
    evs.forEach((a) => {
      if (a.content == '+') {
        totalLikeAmount = totalLikeAmount + 1;
        if (a.pubkey == $userPublickey) {
          liked = true
        }
      }
    });
  });
  loading = false;
  async function likePost() {
    if (liked) return
    await event.react("+", true)
  }
</script>

<div on:click={likePost} class="flex gap-1.5">
  <Fa class="self-center {liked ? 'text-danger' : 'cursor-pointer'}" icon={faHeart} />
  {#if loading}...{:else}{totalLikeAmount}{/if}
</div>
