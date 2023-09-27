<script lang="ts">
	import { onMount } from 'svelte';
	import { recipeTags, type recipeTagSimple } from '$lib/consts';

	const maxAutocompleteOptions = 7;

	export let placeholderString: string;
	export let actionString: string;
	export let action: (query: string) => void;

	let tagquery = '';
	let filteredTags: recipeTagSimple[] = [];
	let showAutocomplete = false;
	let inputFocused = false;

	function handleInputChange(event: Event) {
		const input = event.target as HTMLInputElement;
		tagquery = input.value.toLowerCase();

		filteredTags = recipeTags
			.filter((tag) => tag.title.toLowerCase().includes(tagquery))
			.sort((a, b) => {
				// Sort by relevancy (more exact matches come first)
				const aIncludes = a.title.toLowerCase().includes(tagquery);
				const bIncludes = b.title.toLowerCase().includes(tagquery);

				if (aIncludes && !bIncludes) return -1;
				if (!aIncludes && bIncludes) return 1;
				return 0;
			})
			.slice(0, maxAutocompleteOptions);

		showAutocomplete = tagquery.length > 0 && inputFocused;

		// Listen for mousedown events on the autocomplete items to prevent event propagation
		const autocompleteItems = document.querySelectorAll('.autocomplete-item');
		autocompleteItems.forEach((item) => {
			item.addEventListener('mousedown', (event) => {
				event.stopPropagation();
			});
		});
	}

	function handleInputFocus() {
		inputFocused = true;
		showAutocomplete = tagquery.length > 0;
	}

	function handleInputBlur() {
		// Close autocomplete on blur
		inputFocused = false;

		// Delay setting showAutocomplete to false to allow click events to propagate
		setTimeout(() => {
			showAutocomplete = false;
		}, 200);
	}

	onMount(() => {
		// Initialize filteredTags with all tags on component mount
		filteredTags = recipeTags.slice(0, maxAutocompleteOptions);
	});
</script>

<div class="mb-4 relative">
	<form
		class="mt- flex rounded-md shadow-sm"
		on:submit|preventDefault={() => {
			if (tagquery) {
				action(tagquery);
				tagquery = '';
			}
		}}
	>
		<div class="flex items-stretch flex-grow focus-within:z-10">
			<input
				bind:value={tagquery}
				on:input={handleInputChange}
				on:focus={handleInputFocus}
				on:blur={handleInputBlur}
				class="focus:ring-blue-300 focus:border-blue-300 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
				placeholder={placeholderString}
			/>
		</div>
		<button
			type="submit"
			class="-ml-px inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
		>
			{actionString}
		</button>
	</form>
	{#if showAutocomplete && filteredTags.length > 0}
		<ul
			class="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-lg mt-1 z-[60]"
		>
			{#each filteredTags as tag (tag.title)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					on:click={() => {
						tagquery = tag.title;
						action(tagquery);
						tagquery = '';
					}}
					class="cursor-pointer p-2 hover:bg-gray-100 autocomplete-item"
				>
					{#if tag.emoji}
						<span>{tag.emoji} </span>
					{/if}
					{tag.title}
				</li>
			{/each}
		</ul>
	{/if}
</div>
