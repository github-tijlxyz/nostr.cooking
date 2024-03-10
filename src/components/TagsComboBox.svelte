<script lang="ts">
  import { recipeTags, type recipeTagSimple } from '$lib/consts';
  import type { Writable } from 'svelte/store';
  import TagsSearchAutocomplete from './TagsSearchAutocomplete.svelte';
  import TrashIcon from "phosphor-svelte/lib/Trash"
  import { slide } from 'svelte/transition';

  export let selectedTags: Writable<recipeTagSimple[]>;

  function removeTag(index: number) {
    let nSelected = $selectedTags;
    if (index < 0 || index >= nSelected.length) {
      return; // Index out of bounds
    }

    nSelected = [...nSelected.slice(0, index), ...nSelected.slice(index + 1)];
    selectedTags.set(nSelected);
  }

  function addTag(query: string) {
    let nSelected = $selectedTags;
    let tag = recipeTags.find(
      (e) => query.toLowerCase().replaceAll(' ', '-') == e.title.toLowerCase().replaceAll(' ', '-')
    );
    if (!tag) {
      tag = { title: query };
    }
    nSelected.push(tag);
    selectedTags.set(nSelected);
  }
</script>

<div class="mb-2">
  {#if $selectedTags.length > 0}
    <ul class="flex flex-col gap-2">
      {#each $selectedTags as tag, index}
        <li class="flex input" transition:slide|global={{ duration: 300 }}>
          <span class="grow">
            {#if tag.emoji}
              <span>{tag.emoji} </span>
            {/if}
            {tag.title}
          </span>
          <div class="flex gap-2">
            <button class="self-center text-danger" on:click={() => removeTag(index)}>
              <TrashIcon />
            </button>
          </div>
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
