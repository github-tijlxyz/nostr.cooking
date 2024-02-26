<script lang="ts">
  import { blur, scale } from 'svelte/transition';
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
          <svg
            class="self-center"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            on:click={close}
            aria-label="Close"
            role="button"
          >
            <path
              d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <slot />
      </div>
    </dialog>
  </div>
{/if}
