<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';

  export let text: string;
  export let onClick: () => void;
  export let selected: boolean;
</script>

<span class="cursor-pointer mr-1" on:click={onClick}>
    <Badge variant={`${selected ? '' : 'outline'}`}>{text}</Badge>
</span>

<!--
<button
  on:click={onClick}
  type="button"
  class={`
    ml-1
    mb-1
    inline-flex
    items-center
    px-3
    py-1.5
    border
    border-transparent
    text-xs
    font-medium
    rounded-full
    shadow-sm
    text-white
    ${selected ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'}
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-yellow-500
    `}>{text}</button
>
-->
