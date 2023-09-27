<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		if (browser) {
			goto('/recipe/' + $page.params.slug);
		}
	});
</script>
