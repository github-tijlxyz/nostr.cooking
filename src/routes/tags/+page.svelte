<script>
  import { recipeTags } from '$lib/consts';
</script>

<svelte:head>
  <title>all tags on nostr.cooking</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <h1>All Categories</h1>

  <div class="grid grid-cols-5">
    {#each recipeTags as tag}
      <a href="/tag/{tag.title}" class="flex flex-col gap-2">
        <!-- TODO: CHANGE TO WEBP -->
        <img
          alt="Image of {tag.title}"
          src="/tags/{tag.title.toLowerCase()}.webp"
          class="table w-20 h-20 bg-input rounded-full place-self-center"
        />
        <div class="place-self-center">{tag.title}</div>
      </a>
    {/each}
  </div>
</div>

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
