<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import FeedItem from './FeedItem.svelte';
	import { validateMarkdownTemplate } from '$lib/pharser';

	export let events: NDKEvent[];

	events = events.filter((e) => validateMarkdownTemplate(e.content) !== null);
</script>

<div class="">
	{#each events as event}
		<FeedItem {event} />
	{/each}
</div>
