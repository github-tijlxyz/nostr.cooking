<script lang="ts">
  import { goto } from '$app/navigation';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { page } from '$app/stores';

  export let event: NDKEvent;
  export let list = false;

  let link = ""
  $: {
    if (event.id && event.sig && event.kind) {
      const d = event.tags.find((t) => t[0] == 'd')?.[1];
      if (d) {
        const naddr = nip19.naddrEncode({
          identifier: d,
          kind: event.kind,
          pubkey: event.author.hexpubkey
        });
        link = `/${list ? "list": "recipe"}/${naddr}`
      }
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a href={link} class="flex flex-col gap-4 max-w-[160px] place-self-center md:place-self-start self-start hover:text-primary">
  <div
    on:click={open}
    class="rounded-3xl w-[160px] h-[237px] cursor-pointer transition relative overflow-hidden {event.tags.find(
      (e) => e[0] == 'image'
    )?.[0]
      ? 'bg-cover text-white'
      : 'bg-slate-200 animate-pulse'}"
    style={`${
      event.tags.find((e) => e[0] == 'image')?.[0] &&
      `background-image: url('${event.tags.find((e) => e[0] == 'image')?.[1]}');`
    }`}
  />

  <h5 class="text-md leading-tight text-wrap">
    {#if event?.tags.find((e) => e[0] == 'title')?.[0] && event?.tags.find((e) => e[0] == 'title')?.[1]}
      {event.tags.find((e) => e[0] == 'title')?.[1]}
    {:else}
      {event.tags.find((e) => e[0] == 'd')?.[1]}
    {/if}
  </h5>
</a>
