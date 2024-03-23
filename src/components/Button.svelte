<script lang="ts">
  export let primary = true;
  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let disabled = false;
</script>

<button
  {type}
  class="text-white rounded-full {primary
    ? 'bg-primary disabled:bg-primary/50 hover:bg-[#d64000]'
    : 'bg-black disabled:bg-black/50 hover:bg-gray-800'} px-4 py-2.5 font-semibold transition duration-300 {$$props.class}"
  on:click
  {disabled}
>
  <slot />
</button>
