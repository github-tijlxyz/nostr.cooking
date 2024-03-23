<script lang="ts">
  import { blur, scale } from 'svelte/transition';
  import CloseIcon from 'phosphor-svelte/lib/XCircle';
  export let open = false;
  export let cleanup: (() => void) | null = null;

  // if some variables need to be erased when it's closed, we can do that here.
  function close() {
    if (cleanup !== null) cleanup();
    // for good measure
    open = false;
  }
</script>

{#if open}
  <div
    on:click|self={close}
    role="presentation"
    transition:blur={{ duration: 250 }}
    class="fixed top-0 left-0 z-30 w-full h-full backdrop-brightness-50 backdrop-blur"
  >
    <dialog
      transition:scale={{ duration: 250 }}
      aria-labelledby="title"
      aria-modal="true"
      class="absolute m-0 top-1/2 left-1/2 px-2 md:px-8 pt-6 pb-8 rounded-3xl w-full md:w-[calc(100vw - 4em)] max-w-xl h-[calc(100vh - 4em)] -translate-x-1/2 -translate-y-1/2 bg-white"
      open
    >
      <div class="flex flex-col gap-6">
        <div class="flex justify-between">
          <slot class="self-center" id="title" name="title" />
          <button class="self-center cursor-pointer" on:click={close}>
            <CloseIcon size={24} />
          </button>
        </div>
        <slot />
      </div>
    </dialog>
  </div>
{/if}
