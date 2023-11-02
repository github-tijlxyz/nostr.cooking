<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => goto('/settings'));
</script>

<svelte:head>
  <title>login to nostr.cooking</title>
</svelte:head>
