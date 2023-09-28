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

  function formatTag (tag: recipeTagSimple) {
    return `${tag.emoji ? `${tag.emoji} ` : ''}${tag.title}`
  }
</script>

{#each tags as tag, i}
  {#if i !== 0}&nbsp;•&nbsp;{/if}
  {#if link}
  <a href="/tag/{tag.title}" class="underline cursor-pointer">
    {formatTag(tag)}
  </a>
  {:else}
  <span>
    {formatTag(tag)}
  </span>
  {/if}
{/each}
