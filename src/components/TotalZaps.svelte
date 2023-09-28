<script lang="ts">
  import { ndk } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { decode } from '@gandlaf21/bolt11-decode';
  import { formatAmount } from '$lib/utils';

  export let event: NDKEvent;
  let totalZapAmount: number = 0;

  onMount(async () => {
    const evs = await $ndk.fetchEvents({
      kinds: [9735],
      '#e': [event.id]
    });
    evs.forEach((a) => {
      let bolt11 = a.tags.find((e) => e[0] == 'bolt11')?.[1];
      if (bolt11) {
        let decoded = decode(bolt11);
        totalZapAmount =
          totalZapAmount + Number(decoded.sections.find((e) => e.name == 'amount').value);
      }
    });
  });
</script>

<span>{formatAmount(totalZapAmount / 1000)} sats</span>
