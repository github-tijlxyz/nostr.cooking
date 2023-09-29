<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    localStorage.clear();
    window.indexedDB.databases().then((r: any[]) => {
      for (let i = 0; i < r.length; i++) {
        window.indexedDB.deleteDatabase(r[i].name);
      }
    });
    window.location.href = '/';
  });
</script>
