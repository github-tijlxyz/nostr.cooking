<script lang="ts">
  export let text: string;
  export let onClick: () => void;
  export let selected: boolean;
</script>

<button
  on:click={onClick}
  type="button"
  class={`
    px-4
    py-3
    font-semibold
    rounded-full
    text-black
    text-center
    ${selected ? 'bg-accent-gray' : 'bg-input hover:bg-gray-200'}
    `}>{text}</button
>
