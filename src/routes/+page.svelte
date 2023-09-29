<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userPublickey } from '$lib/nostr';
  import { nip19 } from 'nostr-tools';

  onMount(async () => {
    if ($userPublickey !== '') {
      goto(`/user/${nip19.npubEncode($userPublickey)}`);
    } else {
      goto(`/recent`);
    }
  });
</script>
