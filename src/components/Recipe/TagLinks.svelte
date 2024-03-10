<script lang="ts">
  import { recipeTags, type recipeTagSimple } from '$lib/consts';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  export let event: NDKEvent;
  export let link = true;

  let nameTagFound = false;

  let tags: recipeTagSimple[] = [];

  event.tags.forEach((t) => {
    if (
      t[0] == 't' &&
      t[1].startsWith('nostrcooking-') &&
      nameTagFound == false &&
      t[1].slice(13) == event.tags.find((a) => a[0] == 'd')?.[1]
    ) {
      nameTagFound = true;
    } else if (t[0] == 't' && t[1].startsWith('nostrcooking-')) {
      let coupleRecipeTagInfo = recipeTags.find(
        (e) => e.title.toLowerCase().replaceAll(' ', '-') == t[1].slice(13)
      );
      if (coupleRecipeTagInfo) {
        tags.push(coupleRecipeTagInfo);
      } else {
        tags.push({ title: t[1].slice(13).replaceAll('-', ' ') });
      }
    }
  });
</script>

<div class="flex gap-2 text-[14px]">
  {#each tags as tag}
    <a
      href="/tag/{tag.title}"
      class="rounded-full px-2 py-1 bg-input text-black hover:bg-accent-gray transition duration-300
     cursor-pointer"
    >
      {tag.title}
    </a>
  {/each}
</div>
