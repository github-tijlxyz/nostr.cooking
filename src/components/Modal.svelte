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
      class="absolute m-0 top-1/2 left-1/2 p-[1em] rounded-xl w-[calc(100vw - 4em)] max-w-xl h-[calc(100vh - 4em)] -translate-x-1/2 -translate-y-1/2 bg-white"
      open
    >
      <div class="flex flex-col gap-3">
        <div class="flex justify-between">
          <slot id="title" name="title" />
          <div on:click={close}>
            <CloseIcon size={24} />
          </div>
        </div>
        <slot />
      </div>
    </dialog>
  </div>
{/if}
