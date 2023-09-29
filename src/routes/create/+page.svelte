<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import TagsComboBox from '../../components/TagsComboBox.svelte';
  import StringComboBox from '../../components/StringComboBox.svelte';
  import { ndk } from '$lib/nostr';
  import { createMarkdown, validateMarkdownTemplate } from '$lib/pharser';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { recipeTagSimple } from '$lib/consts';
  import FeedItem from '../../components/FeedItem.svelte';
  import { browser } from '$app/environment';
    import { goto } from '$app/navigation';

  let previewEvent: NDKEvent | undefined = undefined;

  let title = '';
  let image = '';
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
        if (image !== '') {
          previewEvent.tags.push(['image', image]);
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
        if (image !== '') {
          event.tags.push(['image', image]);
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
        resultMessage = 'Succes!';
        setTimeout(() => {
          goto(`/recipe/${event.id}`);
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
            bind:value={title}
            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <div class="pt-8">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Image</h3>
        <p class="mt-1 text-sm text-gray-500">
          Recommended to add for more interest! Show's up in lists, at recent recipies or profile
          page (you can upload a file and get a link on <a
            class="underline"
            target="_blank"
            rel="noopener noreferrer"
            href="https://nostr.build">nostr.build</a
          >)
        </p>
      </div>

      <div class="sm:col-span-6">
        <div class="mt-1">
          <input
            placeholder="https://example.com/image.png"
            bind:value={image}
            class="shadow-sm mt-3 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

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
        </div>

        <div class="sm:col-span-6">
          <div class="mt-1">
            <textarea
              placeholder="Some breef discription of the dish (can also be the same as chef's notes)"
              bind:value={summary}
              rows="3"
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
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
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
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
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="sm:col-span-4">
          <label for="email" class="block text-sm font-medium text-gray-700"> 🍳 Cook time </label>
          <div class="mt-1">
            <input
              placeholder="1 hour and 5 min"
              bind:value={cooktime}
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
				<summary>Add Additional Resources (Custom Markdown)</summary>
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
							class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
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
