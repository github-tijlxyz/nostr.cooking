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
      .map((tag) => ({
        tag,
        relevancy: tag.title.toLowerCase().split(tagquery).length - 1
      }))
      .sort((a, b) => {
        // Sort by relevancy (more exact matches come first)
        if (a.relevancy > b.relevancy) return -1;
        if (a.relevancy < b.relevancy) return 1;
        return 0;
      })
      .map((item) => item.tag)
      .slice(0, 512);

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

<div class="relative">
  <form
    class="flex rounded-xl shadow-sm"
    on:submit|preventDefault={() => {
      if (tagquery) {
        action(tagquery);
        tagquery = '';
      }
    }}
  >
    <div class="flex mx-0.5 items-stretch flex-grow focus-within:z-10">
      <input
        bind:value={tagquery}
        on:input={handleInputChange}
        on:focus={handleInputFocus}
        on:blur={handleInputBlur}
        class="block w-full rounded-xl sm:text-sm border-0 bg-input"
        placeholder={placeholderString}
      />
    </div>
    <input type="submit" class="hidden" />
  </form>
  {#if showAutocomplete && filteredTags.length > 0}
    <ul
      class="max-h-[256px] overflow-y-scroll absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-xl mt-1 z-[60]"
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
