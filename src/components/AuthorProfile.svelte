<script lang="ts">
  import { nip19 } from 'nostr-tools';
  import { ndk } from '$lib/nostr.js';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import Button from './Button.svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';

  export let pubkey: string;
</script>

<div class="flex gap-4">
  <a href="/user/{nip19.npubEncode(pubkey)}" class="flex gap-4 self-center">
    <Avatar class="w-14 h-14 rounded-full self-center" ndk={$ndk} {pubkey} />
    <Name class="self-center" ndk={$ndk} {pubkey} />
  </a>
  <!-- <Button class="flex self-center">Follow</Button> -->
</div>
