<script lang="ts">
	let inputNewThing: string = '';
	export let selected: string[] = [];
	export let placeholder: string;
	export let showIndex: boolean;

	function removeTag(index: number) {
		selected = selected.filter((_, i) => i !== index);
		selected = selected;
	}

	function addTag() {
		if (inputNewThing) {
			let tag = inputNewThing;
			inputNewThing = '';
			selected.push(tag);
			selected = selected;
		}
	}

	function moveTagUp(index: number) {
		if (index > 0) {
			const temp = selected[index];
			selected[index] = selected[index - 1];
			selected[index - 1] = temp;
			selected = selected;
		}
	}

	function moveTagDown(index: number) {
		if (index < selected.length - 1) {
			const temp = selected[index];
			selected[index] = selected[index + 1];
			selected[index + 1] = temp;
			selected = selected;
		}
	}
</script>

<div class="mb-2">
	{#if selected.length > 0}
		<ul class="bg-white border border-gray-300 rounded-lg mt-1">
			{#each selected as tag, index}
				<li class="flex items-center justify-between p-2 hover:bg-gray-100">
					<div class="flex items-center pl-1">
						{#if showIndex}{index + 1}. {/if}{tag}
					</div>
					<div class="flex">
						{#if showIndex && index > 0}
							<button
								type="button"
								class="ml-2 px-2 py-[0.05rem] bg-gray-400 hover:bg-gray-500 text-white rounded"
								on:click={() => moveTagUp(index)}
							>
								↑
							</button>
						{/if}
						{#if showIndex && index < selected.length - 1}
							<button
								type="button"
								class="ml-2 px-2 py-[0.05rem] bg-gray-400 hover:bg-gray-500 text-white rounded"
								on:click={() => moveTagDown(index)}
							>
								↓
							</button>
						{/if}
						<button
							type="button"
							class="ml-2 px-2 py-[0.05rem] bg-red-500 hover:bg-red-600 text-white rounded"
							on:click={() => removeTag(index)}
						>
							X
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<div class="mt- flex rounded-md shadow-sm">
	<div class="flex items-stretch flex-grow focus-within:z-10">
		<input
			bind:value={inputNewThing}
			class="focus:ring-blue-300 focus:border-blue-300 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
			{placeholder}
		/>
	</div>
	<button
		type="button"
		on:click={addTag}
		class="-ml-px inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
	>
		Add
	</button>
</div>
