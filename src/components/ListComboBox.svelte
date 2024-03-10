<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Button from './Button.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';

  type Atype = {
    title?: string;
    naddr: string;
  };

  let inputNewThing: string = '';
  export let selected: Writable<Atype[]>;
  export let placeholder: string;
  export let showIndex: boolean = false;

  function removeTag(index: number) {
    let nSelected = $selected;
    if (index < 0 || index >= nSelected.length) {
      return; // Index out of bounds
    }

    nSelected = [...nSelected.slice(0, index), ...nSelected.slice(index + 1)];
    selected.set(nSelected);
  }

  function addTag() {
    let nSelected = $selected;
    if (inputNewThing) {
      let tag = inputNewThing;
      inputNewThing = '';
      nSelected.push({ naddr: tag });
      selected.set(nSelected);
    }
  }

  function moveTagUp(index: number) {
    let nSelected = $selected;
    if (index > 0) {
      const temp = nSelected[index];
      nSelected[index] = nSelected[index - 1];
      nSelected[index - 1] = temp;
      selected.set(nSelected);
    }
  }

  function moveTagDown(index: number) {
    let nSelected = $selected;
    if (index < nSelected.length - 1) {
      const temp = nSelected[index];
      nSelected[index] = nSelected[index + 1];
      nSelected[index + 1] = temp;
      selected.set(nSelected);
    }
  }
</script>

<div class="mb-0">
  {#if $selected.length > 0}
    <ul class="flex flex-col gap-2">
      {#each $selected as tag, index}
        <li class="flex input" transition:slide|global={{ duration: 300 }}>
          <a class="grow underline" target="_blank" href={`/recipe/${tag.naddr}`}
            >{#if tag.title}{tag.title}{:else}{tag.naddr}{/if}</a
          >
          <div class="flex gap-2">
            {#if showIndex && index > 0}
              <button
                type="button"
                class="px-2 py-[0.05rem] rounded"
                on:click={() => moveTagUp(index)}
              >
                ↑
              </button>
            {/if}
            {#if showIndex && index < $selected.length - 1}
              <button
                type="button"
                class="px-2 py-[0.05rem] rounded"
                on:click={() => moveTagDown(index)}
              >
                ↓
              </button>
            {/if}
            <button class="self-center text-danger" on:click={() => removeTag(index)}>
              <TrashIcon />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<form on:submit|preventDefault={addTag} class="flex gap-2">
  <input bind:value={inputNewThing} class="input grow" {placeholder} />
  <Button on:click={addTag} primary={false}>Add</Button>
</form>
