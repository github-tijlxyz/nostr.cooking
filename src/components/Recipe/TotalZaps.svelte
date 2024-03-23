<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { decode } from '@gandlaf21/bolt11-decode';
  import { formatAmount } from '$lib/utils';
  import LightningIcon from 'phosphor-svelte/lib/Lightning';

  export let event: NDKEvent;
  let loading = true;
  let totalZapAmount: number = 0;
  let didSigs = new Map();
  let zapped = false;

  async function fetch() {
    const evs = await $ndk.fetchEvents({
      kinds: [9735],
      '#a': [`${event.kind}:${event.author.hexpubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]
    });
    evs.forEach((a) => {
      if (a.pubkey == $userPublickey) zapped = true;
      let bolt11 = a.tags.find((e) => e[0] == 'bolt11')?.[1];
      if (bolt11 && a.sig) {
        if (!didSigs.has(a.sig)) {
          let decoded = decode(bolt11);
          totalZapAmount =
            totalZapAmount + Number(decoded.sections.find((e) => e.name == 'amount').value);
          didSigs.set(a.sig, a.sig);
        }
      }
    });
  }

  $: {
    fetch();
  }
  loading = false;
</script>

<div class="flex gap-1.5 hover:bg-input rounded px-0.5 transition duration-300">
  <LightningIcon size={24} />
  {#if loading}...{:else}{formatAmount(totalZapAmount / 1000)} sats{/if}
</div>
