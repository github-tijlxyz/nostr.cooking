<script>
  import { recipeTags } from '$lib/consts';
</script>

<svelte:head>
  <title>all tags on nostr.cooking</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <h1>All Categories</h1>

  <div class="grid grid-cols-6">
    {#each recipeTags as tag}
      <a href="/tag/{tag.title}" class="flex flex-col gap-2">
        <div class="table w-[120px] h-[120px] bg-input rounded-full place-self-center">
          <div class="table-cell align-middle place-self-center text-center text-7xl">
            {tag.emoji}
          </div>
        </div>
        <div class="place-self-center">{tag.title}</div>
      </a>
    {/each}
  </div>
</div>

<div class="text-center text-lg">
  Please add more tags <a
    class="underline"
    href="https://github.com/github-tijlxyz/nostr.cooking/blob/main/src/lib/consts.ts#L23">here</a
  >
</div>
