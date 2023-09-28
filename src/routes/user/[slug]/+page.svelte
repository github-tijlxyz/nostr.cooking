<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/nostr';
	import type { NDKEvent, NDKFilter, NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
	import { nip19 } from 'nostr-tools';
	import { onMount } from 'svelte';
	import Feed from '../../../components/Feed.svelte';
	import { validateMarkdownTemplate } from '$lib/pharser';
	import { goto } from '$app/navigation';

	let hexpubkey: string | undefined = undefined;
	let events: NDKEvent[] = [];
	let user: NDKUserProfile;
	let loaded = false;

	if ($page.params.slug.startsWith(`npub1`)) {
		hexpubkey = nip19.decode($page.params.slug).data.toString();
	} else {
		goto(`/r/user/${nip19.npubEncode($page.params.slug)}`)
	}

	onMount(async () => {
		if (hexpubkey) {
			let filter: NDKFilter = {
				authors: [hexpubkey],
				limit: 256,
				kinds: [30023],
				'#t': ['nostrcooking']
			};
			const evts = await $ndk.fetchEvents(filter);
			let evtsArr = Array.from(evts);
			evtsArr.forEach((ev, i) => {
				if (validateMarkdownTemplate(ev.content) == null) {
					evtsArr.splice(i, 1);
				}
			});
			events = evtsArr;

			const u = await $ndk.getUser({ hexpubkey: hexpubkey }).fetchProfile();
			if (u) {
				user = u;
			}

			loaded = true;
		}
	});
</script>

<div class="prose mb-6">
	<h1>
		<a class="underline" href="nostr:{$page.params.slug}"
			>{#if user && user.name}{user.name}{:else}...{/if}</a
		>'s Recipes
	</h1>
</div>

{#if events.length > 0}
	<Feed {events} />
{:else if loaded == false}
	<p>loading</p>
{:else}
	<p>Nothing found here :(</p>
{/if}
