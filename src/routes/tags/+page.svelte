<script>
  import { recipeTags } from '$lib/consts';
</script>

<svelte:head>
  <title>all tags on nostr.cooking</title>
</svelte:head>

<h1 class="text-3xl text-center mt-5 mb-0">All Tags</h1>

<div class="text-xl text-center px-[10vw] pt-6 pb-2">
  {#each recipeTags as recipeTag}
    <a
      href={`/tag/${recipeTag.title.toLowerCase().replaceAll(' ', '-')}`}
      class="mb-3 inline-block hover:underline mx-3"
    >
      {#if recipeTag.emoji}{recipeTag.emoji} {recipeTag.title}{:else}{recipeTag.title}{/if}
    </a>
  {/each}
</div>

<div class="text-center text-lg">
  Please add more tags <a
    class="underline"
    href="https://github.com/github-tijlxyz/nostr.cooking/blob/main/src/lib/consts.ts#L23">here</a
  >
</div>
