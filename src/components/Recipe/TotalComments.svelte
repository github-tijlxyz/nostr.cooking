<script lang="ts">
  import { ndk } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import CommentIcon from 'phosphor-svelte/lib/ChatTeardropText';

  export let event: NDKEvent;
  let loading = true;
  let totalLikeAmount: number = 0;

  onMount(async () => {
    const evs = await $ndk.fetchEvents({
      kinds: [1],
      '#a': [`${event.kind}:${event.author.hexpubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]
    });
    evs.forEach(() => {
      totalLikeAmount = totalLikeAmount + 1;
    });
  });
  loading = false;
</script>

<div class="flex gap-1.5">
  <CommentIcon size={24} />
  {#if loading}...{:else}{totalLikeAmount}{/if}
</div>
