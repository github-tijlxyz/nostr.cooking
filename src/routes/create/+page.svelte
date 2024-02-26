<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import TagsComboBox from '../../components/TagsComboBox.svelte';
  import StringComboBox from '../../components/StringComboBox.svelte';
  import { ndk } from '$lib/nostr';
  import { createMarkdown, validateMarkdownTemplate } from '$lib/pharser';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { recipeTagSimple } from '$lib/consts';
  import FeedItem from '../../components/RecipeCard.svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { nip19 } from 'nostr-tools';
  import ImagesComboBox from '../../components/ImagesComboBox.svelte';
  import Button from '../../components/Button.svelte';

  let previewEvent: NDKEvent | undefined = undefined;

  let title = '';
  let images: Writable<string[]> = writable([]);
  let selectedTags: Writable<recipeTagSimple[]> = writable([]);
  let summary = '';
  let chefsnotes = '';
  let preptime = '';
  let cooktime = '';
  let servings = '';
  let ingredientsArray: Writable<string[]> = writable([]);
  let ingredients = ``;
  let directionsArray: Writable<string[]> = writable([]);
  let directions = ``;
  let additionalMarkdown = '';

  let resultMessage = ' ';
  let disablePublishButton = false;

  function formatStringArrays() {
    ingredients = '';
    $ingredientsArray.forEach((e) => {
      ingredients += `- ${e}\n`;
    });
    directions = '';
    let i = 0;
    $directionsArray.forEach((e) => {
      i++;
      directions += `${i}. ${e}\n`;
    });
  }

  async function loadPreview() {
    formatStringArrays();
    if (browser) {
      const md = createMarkdown(
        chefsnotes,
        preptime,
        cooktime,
        servings,
        ingredients,
        directions,
        additionalMarkdown
      );
      const va = validateMarkdownTemplate(md);
      if (typeof va == 'string') {
        resultMessage = `Error: ${va}`;
      } else if (va) {
        previewEvent = new NDKEvent($ndk);
        previewEvent.kind = 30023;
        previewEvent.content = md;
        previewEvent.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
        previewEvent.tags.push(['title', title]);
        previewEvent.tags.push(['t', 'nostrcooking']);
        if (summary !== '') {
          previewEvent.tags.push(['summary', summary]);
        }
        if ($images.length > 0) {
          for (let i = 0; i < $images.length; i++) {
            previewEvent.tags.push(['image', $images[i]]);
          }
        }
        $selectedTags.forEach((t) => {
          if (t.title) {
            previewEvent?.tags.push([
              't',
              `nostrcooking-${t.title.toLowerCase().replaceAll(' ', '-')}`
            ]);
          }
        });
      }
    }
  }

  async function publishRecipe() {
    formatStringArrays();
    disablePublishButton = true;
    try {
      const md = createMarkdown(
        chefsnotes,
        preptime,
        cooktime,
        servings,
        ingredients,
        directions,
        additionalMarkdown
      );
      const va = validateMarkdownTemplate(md);
      if (typeof va == 'string') {
        resultMessage = `Error: ${va}`;
      } else if (va) {
        const event = new NDKEvent($ndk);
        event.kind = 30023;
        event.content = md;
        event.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
        event.tags.push(['title', title]);
        event.tags.push(['t', 'nostrcooking']);
        event.tags.push(['t', `nostrcooking-${title.toLowerCase().replaceAll(' ', '-')}`]);
        if (summary !== '') {
          event.tags.push(['summary', summary]);
        }
        if ($images.length > 0) {
          for (let i = 0; i < $images.length; i++) {
            event.tags.push(['image', $images[i]]);
          }
        }
        $selectedTags.forEach((t) => {
          if (t.title) {
            event.tags.push(['t', `nostrcooking-${t.title.toLowerCase().replaceAll(' ', '-')}`]);
          }
        });
        console.log('event to publish:', event);
        let relays = await event.publish();
        relays.forEach((relay) => {
          relay.once('published', () => {
            console.log('published to', relay);
          });
          relay.once('publish:failed', (relay, err) => {
            console.log('publish failed to', relay, err);
          });
        });
        resultMessage = 'Success!';
        const naddr = nip19.naddrEncode({
          identifier: title.toLowerCase().replaceAll(' ', '-'),
          pubkey: event.author.hexpubkey,
          kind: 30023
        });
        setTimeout(() => {
          goto(`/recipe/${naddr}`);
        }, 2500);
      }
    } catch (err) {
      console.error('error while publishing', err);
      resultMessage = 'Error: Something went wrong, Error: ' + String(err);
    } finally {
      disablePublishButton = false;
      if (resultMessage == 'Processing...') {
        resultMessage = ' ';
      }
    }
  }
</script>

<svelte:head>
  <title>create a recipe on nostr.cooking</title>
</svelte:head>

<form on:submit|preventDefault={publishRecipe} class="flex flex-col gap-6 mx-0.5">
  <h1>Create Recipe</h1>
  <div class="flex flex-col gap-2">
    <h3>Title*</h3>
    <span class="text-caption">Remember to make your title unique!</span>
    <input
      placeholder="Title"
      bind:value={title}
      class="input"
    />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Tags*</h3>
    <span class="text-caption">Remember to make your title unique!</span>
    <TagsComboBox {selectedTags} />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Brief Summary</h3>
    <textarea
      placeholder="Some brief description of the dish (can be the same as chef’s notes)"
      bind:value={summary}
      rows="6"
      class="input"
    />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Chef's Notes</h3>
    <span class="text-caption">Some notes about this recipe. (Markdown is supported)</span>
    <textarea
      placeholder="Eg. where the recipe is from, or any additional information"
      bind:value={chefsnotes}
      rows="6"
      class="input"
    />
  </div>

  <div class="flex flex-col gap-4">
    <h3>Details</h3>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Prep Time</span>
      <input
        placeholder="20 min"
        bind:value={preptime}
        class="input"
      />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Cooking Time</span>
      <input
        placeholder="1 hour and 5 min"
        bind:value={cooktime}
        class="input"
      />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Servings (persons)</span>
      <input
        placeholder="4"
        bind:value={servings}
        class="input"
      />
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <h3>Ingredients*</h3>
    <StringComboBox placeholder={'2 eggs'} selected={ingredientsArray} showIndex={false} />
  </div>
  <div class="flex flex-col gap-2">
    <h3>Directions*</h3>
    <StringComboBox placeholder={'Bake for 30 min'} selected={directionsArray} showIndex={false} />
  </div>
  <div>
    <h3>Cover Image</h3>
    <span class="text-caption">Appears on the recipe card</span>
    <ImagesComboBox uploadedImages={images} />
  </div>
  <div class="flex justify-end">
    <div>
      {resultMessage}
      <button />
      <Button disabled={disablePublishButton} type="submit">
        Publish
      </Button>
    </div>
  </div>
</form>

<div class="flex flex-col gap-2">
  <h2>Card Preview</h2>
  <div>
    <Button
      on:click={loadPreview}
    >
      Load Preview
    </Button>
  </div>
  <div class="">
    {#if previewEvent}
      <FeedItem event={previewEvent} />
    {/if}
  </div>
</div>
