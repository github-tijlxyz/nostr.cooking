<script lang="ts">
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import Button from '../../../components/Button.svelte';
  import ImagesComboBox from '../../../components/ImagesComboBox.svelte';
  import { writable, type Writable } from 'svelte/store';

  let title = '';
  let images: Writable<string[]> = writable([]);
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
      if ($images.length === 1) {
        event.tags.push(['image', $images[0]]);
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
        goto(`/list/${naddr}/fork`);
      }, 250);
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

<svelte:head>
  <title>create a list on nostr.cooking</title>
</svelte:head>

<form on:submit|preventDefault={createList} class="flex flex-col gap-6 mx-0.5">
  <h1>New List</h1>
  <div class="flex flex-col gap-2">
    <h3>Title*</h3>
    <span class="text-caption">Remember to make your title unique!</span>
    <input
      placeholder="Italian Favorites"
      bind:value={title}
      class="input"
    />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Summary</h3>
    <textarea
      placeholder="A brief description of what this list is about."
      bind:value={summary}
      rows="6"
      class="input"
    />
  </div>

  <div>
    <h3>Cover Image</h3>
    <span class="text-caption">Appears on your Profile and on the List's page, optional.</span>
    <ImagesComboBox uploadedImages={images} limit={1} />
  </div>

  <div class="flex justify-end">
    <div>
      {resultMessage}
      <button />
      <Button disabled={disablePublishButton} type="submit">
        Create List
      </Button>
    </div>
  </div>
</form>
