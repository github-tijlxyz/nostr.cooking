<script lang="ts">
  export let primary = true;
</script>

<button class="text-white rounded-full {primary ? 'bg-[#EC4700]' : 'bg-black'} px-4 py-2.5 {$$props.class}" on:click>
  <slot />
</button>