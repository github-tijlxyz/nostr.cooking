<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import { decode } from '@gandlaf21/bolt11-decode';
  import { formatAmount } from '$lib/utils';
  import Fa from 'svelte-fa';
  import { faBoltLightning } from '@fortawesome/free-solid-svg-icons';

  export let event: NDKEvent;
  let loading = true;
  let totalZapAmount: number = 0;
  let didSigs = new Map();
  let zapped = false;

  onMount(async () => {
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
  });
  loading = false;
</script>

<div class="flex gap-1.5">
  <Fa class="self-center {zapped ? 'text-yellow-500' : ''}" icon={faBoltLightning} />
  {#if loading}...{:else}{formatAmount(totalZapAmount / 1000)} sats{/if}
</div>
