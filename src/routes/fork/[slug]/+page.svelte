<script lang="ts">
  import TagsComboBox from '../../../components/TagsComboBox.svelte';
  import { ndk, userPublickey } from '$lib/nostr';
  import { createMarkdown, validateMarkdownTemplate } from '$lib/pharser';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { recipeTags, type recipeTagSimple } from '$lib/consts';
  import FeedItem from '../../../components/RecipeCard.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import StringComboBox from '../../../components/StringComboBox.svelte';
  import { writable, type Writable } from 'svelte/store';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import ImagesComboBox from '../../../components/ImagesComboBox.svelte';
  import Button from '../../../components/Button.svelte';

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  onMount(() => {
    if ($userPublickey == "")
      goto("/login")
  })

  let previewEvent: NDKEvent | undefined = undefined;

  function addTag(query: string) {
    let tag = recipeTags.find(
      (e) => query.toLowerCase().replaceAll(' ', '-') == e.title.toLowerCase().replaceAll(' ', '-')
    );
    if (!tag) {
      tag = { title: query };
    }
    $selectedTags.push(tag);
    selectedTags = selectedTags;
  }

  async function loadData() {
    let event: NDKEvent;
    if ($page.params.slug.startsWith('naddr1')) {
      const b = nip19.decode($page.params.slug).data;
      let e = await $ndk.fetchEvent({
        // @ts-ignore
        '#d': [b.identifier],
        // @ts-ignore
        authors: [b.pubkey],
        kinds: [30023]
      });
      if (e) {
        event = e;
      }
    } else {
      let e = await $ndk.fetchEvent($page.params.slug);
      if (e) {
        event = e;
        const c = nip19.naddrEncode({
          // @ts-ignore
          identifier: e.tags.find((z) => z[0] == 'd')?.[1],
          // @ts-ignore
          kind: e.kind,
          pubkey: e.author.hexpubkey
        });
        goto(`/fork/${c}`);
      }
    }
    // @ts-ignore
    if (event) {
      const va = validateMarkdownTemplate(event.content);
      if (typeof va == 'string') {
        resultMessage = `Error loading event to fork, error message: ${va}`;
      } else if (va) {
        let titleTagValue = event.tags.find((e) => e[0] == 'title')?.[1];
        if (titleTagValue) title = titleTagValue;
        let summaryTagValue = event.tags.find((e) => e[0] == 'summary')?.[1];
        if (summaryTagValue) summary = summaryTagValue;
        let imageTagsValue = event.tags.filter((e) => e[0] == 'image');
        if (imageTagsValue) {
          for (let i = 0; i < imageTagsValue.length; i++) {
            $images.push(imageTagsValue[i][1]);
          }
          images.set($images); // svelte reactivity
        }
        selectedTags.set([]);
        let tagTags = event.tags.filter(
          (e) =>
            e[0] == 't' &&
            e[1].startsWith('nostrcooking-') &&
            e[1].slice(13) !== event.tags.find((a) => a[0] == 'd')?.[1]
        );
        tagTags.forEach((t) => {
          addTag(t[1].slice(13));
        });
        if (va.chefNotes) chefsnotes = va.chefNotes;
        if (va.directions) {
          let i = 0;
          va.directions.forEach((e) => {
            i++;
            directions += `${i}. ${e}\n`;
          });
          $directionsArray = va.directions;
        }
        if (va.ingredients) {
          va.ingredients.forEach((e) => {
            ingredients += `- ${e}\n`;
          });
          $ingredientsArray = va.ingredients;
        }
        if (va.information?.cookTime) cooktime = va.information.cookTime;
        if (va.information?.prepTime) preptime = va.information.prepTime;
        if (va.information?.servings) servings = va.information.servings;
        if (va.additionalMarkdown) additionalMarkdown = va.additionalMarkdown;
      }
    }
  }

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
      } else if ($images.length == 0) {
        resultMessage = `Error: No Image Uploaded`;
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
      } else if ($images.length == 0) {
        resultMessage = `Error: No Image Uploaded`;
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
        resultMessage = 'Succes!';
        relays.forEach((relay) => {
          relay.once('published', () => {
            console.log('published to', relay);
          });
          relay.once('publish:failed', (relay, err) => {
            console.log('publish failed to', relay, err);
          });
        });
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
  <title>edit recipe {title} on nostr.cooking</title>
</svelte:head>

<form on:submit|preventDefault={publishRecipe} class="flex flex-col gap-6 max-w-[760px] mx-auto">
  <h1>Edit Recipe</h1>
  <div class="flex flex-col gap-2">
    <h3>Title*</h3>
    <span class="text-caption">Remember to make your title unique!</span>
    <input placeholder="Title" bind:value={title} class="input" />
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
      <input placeholder="20 min" bind:value={preptime} class="input" />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Cooking Time</span>
      <input placeholder="1 hour and 5 min" bind:value={cooktime} class="input" />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Servings (persons)</span>
      <input placeholder="4" bind:value={servings} class="input" />
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
    <h3>Cover Image*</h3>
    <span class="text-caption">Appears on the recipe card</span>
    <ImagesComboBox uploadedImages={images} />
  </div>
  <div class="flex justify-end">
    <div>
      {resultMessage}
      <button />
      <Button disabled={disablePublishButton} type="submit">Publish Edits</Button>
    </div>
  </div>
  {#if $images.length > 0 && title && $selectedTags.length > 0 && $directionsArray.length > 0 && $ingredientsArray.length > 0}
    <div class="flex flex-col gap-2">
      <h2>Card Preview</h2>
      <div>
        <Button on:click={loadPreview}>Load Preview</Button>
      </div>
      <div class="">
        {#if previewEvent}
          <FeedItem event={previewEvent} />
        {/if}
      </div>
    </div>
  {/if}
</form>
