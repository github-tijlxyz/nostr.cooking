<script lang="ts">
	import { recipeTags, type recipeTagSimple } from '$lib/consts';
	import TagsSearchAutocomplete from './TagsSearchAutocomplete.svelte';

	export let selectedTags: recipeTagSimple[] = [];

	function removeTag(index: number) {
		selectedTags = selectedTags.filter((_, i) => i !== index);
	}

	function addTag(query: string) {
		let tag = recipeTags.find(
			(e) => query.toLowerCase().replaceAll(' ', '-') == e.title.toLowerCase().replaceAll(' ', '-')
		);
		if (!tag) {
			tag = { title: query };
		}
		selectedTags.push(tag);
		selectedTags = selectedTags;
	}
</script>

<div class="mb-2">
	{#if selectedTags.length > 0}
		<ul class="bg-white border border-gray-300 rounded-lg mt-1">
			{#each selectedTags as tag, index}
				<li class="flex items-center justify-between p-2 hover:bg-gray-100">
					<div class="flex items-center">
						{#if tag.emoji}
							<span>{tag.emoji} </span>
						{/if}
						{tag.title}
					</div>
					<button
						class="ml-2 px-3 py-[0.05rem] bg-red-500 hover:bg-red-600 text-white rounded"
						on:click={() => removeTag(index)}
					>
						X
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<TagsSearchAutocomplete
	placeholderString={"Add a tag like 'italian' or 'steak' or 'glutenfree'"}
	actionString={'Add'}
	action={addTag}
/>
