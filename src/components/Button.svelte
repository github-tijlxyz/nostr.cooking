<script lang="ts">
  export let primary = true;
</script>

<button
  class="text-white rounded-full {primary
    ? 'bg-primary hover:bg-[#d64000]'
    : 'bg-black hover:bg-gray-800'} px-4 py-2.5 font-semibold {$$props.class}"
  on:click
>
  <slot />
</button>
