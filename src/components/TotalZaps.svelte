<script lang="ts">
  import { ndk } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { decode } from '@gandlaf21/bolt11-decode';
  import { formatAmount } from '$lib/utils';

  export let event: NDKEvent;
  let loading = true;
  let totalZapAmount: number = 0;
  let didSigs = new Map();

  onMount(async () => {
    const evs = await $ndk.fetchEvents({
      kinds: [9735],
      '#a': [`${event.kind}:${event.author.hexpubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]
    });
    evs.forEach((a) => {
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
  });
  loading = false;
</script>

<span
  >{#if loading}...{:else}{formatAmount(totalZapAmount / 1000)} sats{/if}</span
>
