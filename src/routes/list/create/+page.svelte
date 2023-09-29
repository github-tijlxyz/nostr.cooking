<script>
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';

  let title = '';
  let image = '';
  let summary = '';
  let resultMessage = '';

  let disablePublishButton = false;

  async function createList() {
    disablePublishButton = true;
    try {
      const event = new NDKEvent($ndk);
      event.kind = 30001;
      event.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
      event.tags.push(['title', title]);
      event.tags.push(['t', 'nostrcooking']);
      if (summary !== '') {
        event.tags.push(['summary', summary]);
      }
      if (image !== '') {
        event.tags.push(['image', image]);
      }
      let relays = await event.publish();
      relays.forEach((relay) => {
        relay.once('published', () => {
          console.log('published to', relay);
        });
        relay.once('publish:failed', (relay, err) => {
          console.log('publish failed to', relay, err);
        });
      });
      let naddr = nip19.naddrEncode({
        identifier: title.toLowerCase().replaceAll(' ', '-'),
        kind: 30001,
        pubkey: event.pubkey
      });
      setTimeout(() => {
        window.location.href = `/list/${naddr}/fork`;
      }, 2500);
    } catch (err) {
      resultMessage = `Error: ${err}`;
    } finally {
      disablePublishButton = false;
      if (resultMessage == 'Processing...') {
        resultMessage = '';
      }
    }
  }
</script>

<form on:submit|preventDefault={createList} class="space-y-8 m-2 divide-y divide-gray-200">
  <div class="space-y-8 divide-y divide-gray-200">
    <div>
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Title*</h3>
      </div>

      <div class="sm:col-span-6">
        <div class="mt-1">
          <input
            bind:value={title}
            placeholder="My List, e.g. 'good recipies for weekdays'"
            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div class="pt-8">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Image</h3>
          <p class="mt-1 text-sm text-gray-500">
            Optional. you can upload a file and get a link on <a
              class="underline"
              target="_blank"
              rel="noopener noreferrer"
              href="https://nostr.build">nostr.build</a
            >
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
            <h3 class="text-lg leading-6 font-medium text-gray-900">Summary</h3>
            <p class="mt-1 text-sm text-gray-500">
              Optional. Show's up in lists, at recent recipies or profile page
            </p>
          </div>

          <div class="sm:col-span-6">
            <div class="mt-1">
              <textarea
                placeholder="What is this list about?"
                bind:value={summary}
                rows="3"
                class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
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
            Create New List
          </button>
        </div>
      </div>
    </div>
  </div>
</form>
