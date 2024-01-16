<script lang="ts">
  import TagsComboBox from '../../../components/TagsComboBox.svelte';
  import { ndk } from '$lib/nostr';
  import { createMarkdown, validateMarkdownTemplate } from '$lib/pharser';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { recipeTags, type recipeTagSimple } from '$lib/consts';
  import FeedItem from '../../../components/FeedItem.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import StringComboBox from '../../../components/StringComboBox.svelte';
  import { writable, type Writable } from 'svelte/store';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import ImagesComboBox from '../../../components/ImagesComboBox.svelte';

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

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

<form on:submit|preventDefault={publishRecipe} class="space-y-8 m-2 divide-y divide-gray-200">
  <div class="space-y-8 divide-y divide-gray-200">
    <div>
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Title*</h3>
        <p class="mt-1 text-sm text-gray-500">Remember to make your title unqiue!</p>
      </div>

      <div class="sm:col-span-6">
        <div class="mt-1">
          <input
            placeholder="My Recipe"
            disabled={true}
            bind:value={title}
            class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <div class="pt-8">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Images</h3>
        <p class="mt-1 text-sm text-gray-500">
          Recommended to add for more interest! Show's up in lists, at recent recipies or profile
          page
        </p>
      </div>

      <ImagesComboBox uploadedImages={images} />

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Tags*</h3>
          <p class="mt-1 text-sm text-gray-500">
            Please add some tags. Start typing to view autocomplete's or click enter for custom Tags
          </p>
        </div>

        <div class="sm:col-span-6">
          <TagsComboBox {selectedTags} />
        </div>
      </div>

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Summary</h3>
          <p class="mt-1 text-sm text-gray-500">
            Show's up in lists, at recent recipies or profile page
          </p>
        </div>

        <div class="sm:col-span-6">
          <div class="mt-1">
            <textarea
              placeholder="Some breef discription of the dish"
              bind:value={summary}
              rows="3"
              class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Chef's Notes</h3>
          <p class="mt-1 text-sm text-gray-500">
            Some notes about this recipe. (Markdown is supported)
          </p>
        </div>

        <div class="sm:col-span-6">
          <div class="mt-1">
            <textarea
              placeholder="Here are some Chef's notes. Like where the recipe came from, and more additional information."
              bind:value={chefsnotes}
              rows="6"
              class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Details</h3>
        </div>

        <div class="sm:col-span-4">
          <label class="block text-sm font-medium text-gray-700"> ⏲️ Prep time </label>
          <div class="mt-1">
            <input
              placeholder="20 min"
              bind:value={preptime}
              class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="sm:col-span-4">
          <label for="email" class="block text-sm font-medium text-gray-700"> 🍳 Cook time </label>
          <div class="mt-1">
            <input
              placeholder="1 hour and 5 min"
              bind:value={cooktime}
              class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="sm:col-span-4">
          <label for="email" class="block text-sm font-medium text-gray-700">
            🍽️ Servings (persons)
          </label>
          <div class="mt-1">
            <input
              placeholder="4"
              bind:value={servings}
              class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Ingredients*</h3>
        </div>
        <div class="sm:col-span-6">
          <div class="mt-1">
            <StringComboBox placeholder={'2 eggs'} selected={ingredientsArray} showIndex={false} />
          </div>
        </div>
      </div>

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Directions*</h3>
        </div>
        <div class="sm:col-span-6">
          <div class="mt-1">
            <StringComboBox
              placeholder={'bake it for 30 min'}
              selected={directionsArray}
              showIndex={true}
            />
          </div>
        </div>
      </div>

      <!-- <details class="pt-8">
				<summary>Add Addtional Resources (Custom Markdown)</summary>
				<div class="pt-1">
					<div>
						<h3 class="text-lg leading-6 font-medium text-gray-900">Addtional Resources</h3>
					</div>
					<div class="sm:col-span-6">
						<div class="mt-1">
							<textarea
							bind:value={additionalMarkdown}
							placeholder="Use **markdown**, you can add a image or video like this ![alt text](https://example.com/test.mp4) or a [link](https://example.com)"
							rows="6"
							class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border border-gray-300 rounded-md"
							/>
						</div>
					</div>
				</div>
			</details> -->
    </div>

    <div class="pt-5">
      <div class="columns-2">
        <div>
          {resultMessage}
          <button />
        </div>
        <div class="flex justify-end">
          <button
            type="submit"
            disabled={disablePublishButton == true}
            class="disabled inline-flex disabled:border-gray-300 items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-black bg-blue-50 disabled:bg-gray-50 disabled:hover:bg-gray-100 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-gray-300 focus:ring-blue-300"
          >
            Publish Recipe
          </button>
        </div>
      </div>
    </div>
  </div>
</form>

<hr class="mt-5 mb-5" />

<div class="columns-2">
  <div class="text-lg font-medium">Card Preview</div>
  <div class="flex justify-end">
    <button
      type="button"
      on:click={loadPreview}
      class="disabled inline-flex disabled:border-gray-300 items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-black bg-blue-50 disabled:bg-gray-50 disabled:hover:bg-gray-100 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-gray-300 focus:ring-blue-300"
    >
      Load Preview
    </button>
  </div>
</div>

<div class="mt-4">
  {#if previewEvent}
    <FeedItem event={previewEvent} />
  {/if}
</div>
