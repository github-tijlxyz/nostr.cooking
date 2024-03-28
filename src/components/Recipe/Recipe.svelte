<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import TagLinks from './TagLinks.svelte';
  import { ndk, userPublickey } from '$lib/nostr';
  import DotsIcon from 'phosphor-svelte/lib/DotsThreeVertical';
  import PencilIcon from 'phosphor-svelte/lib/Pencil';
  import BookmarkIcon from 'phosphor-svelte/lib/BookmarkSimple';
  import Button from '../Button.svelte';
  import { translateOption } from '$lib/state';
  import { translate } from '$lib/translation';
  import { parseMarkdown } from '$lib/pharser';
  import TotalZaps from './TotalZaps.svelte';
  import TotalLikes from './TotalLikes.svelte';
  import TotalComments from './TotalComments.svelte';
  import Comments from '../Comments.svelte';
  import ZapModal from '../ZapModal.svelte';
  import { requestProvider } from 'webln';
  import { nip19 } from 'nostr-tools';
  import Modal from '../Modal.svelte';
  import { clickOutside } from '$lib/clickOutside';
  import AuthorProfile from '../AuthorProfile.svelte';
  import { fade } from 'svelte/transition';
  import { recipeTags, type recipeTagSimple } from '$lib/consts';

  export let event: NDKEvent;
  const naddr = nip19.naddrEncode({
    identifier: event.replaceableDTag(),
    pubkey: event.pubkey,
    kind: 30023
  });
  let zapModal = false;
  let bookmarkModal = false;
  let dropdownActive = false;

  async function zapEvt(amount: number, message: string) {
    zapModal = false;
    if (amount) {
      const a = await event.zap(amount * 1000, message);
      if (a) {
        try {
          const webln = await requestProvider();
          await webln.sendPayment(a);
        } catch (err) {
          console.log('error while handleing zap', err);
        }
      }
    }
  }

  let listsArr: NDKEvent[] = [];
  async function getLists(): Promise<NDKEvent[]> {
    const evts = await $ndk.fetchEvents([
      {
        authors: [$userPublickey],
        limit: 256,
        kinds: [30001],
        '#t': ['nostrcooking']
      },
      {
        '#d': ['nostrcooking-bookmarks'],
        authors: [$userPublickey],
        kinds: [30001]
      }
    ]);
    listsArr = Array.from(evts).sort((a, b) => {
      if (a.replaceableDTag() == 'nostrcooking-bookmarks') return -1;
      if (b.replaceableDTag() == 'nostrcooking-bookmarks') return 1;
      return a.replaceableDTag().localeCompare(b.replaceableDTag());
    });
    return listsArr;
  }

  // If a list's d id is found here, then modifyLists will make the inverse change to what's there currently.
  let toggleLists: Set<string> = new Set();
  let eventsToPublish: NDKEvent[] = [];
  async function modifyLists() {
    const toggleListArr = Array.from(toggleLists);
    for (let i = 0; i < toggleListArr.length; i++) {
      const currentList = listsArr.find((e) => e.replaceableDTag() === toggleListArr[i]);
      if (!currentList) break;
      let newEvents = currentList.getMatchingTags('a');
      const nevent = new NDKEvent($ndk);
      nevent.kind = 30001;
      if (toggleListArr[i] !== 'nostrcooking-bookmarks') nevent.tags.push(['t', 'nostrcooking']);
      nevent.tags.push(['d', toggleListArr[i]]);
      nevent.tags.push(['title', currentList.getMatchingTags('title')[0][1]]);
      const summary = currentList.getMatchingTags('summary');
      if (summary.length > 0) {
        nevent.tags.push(['summary', summary[0][1]]);
      }
      const image = currentList.getMatchingTags('image');
      if (image.length > 0) {
        nevent.tags.push(['image', image[0][1]]);
      }
      if (
        newEvents.find(
          (t) => t[1] === `${event.kind}:${event.author.pubkey}:${event.replaceableDTag()}`
        )
      ) {
        newEvents.forEach((e) => {
          if (e[1] === `${event.kind}:${event.author.pubkey}:${event.replaceableDTag()}`) return;
          nevent.tags.push(['a', e[1]]);
        });
      } else {
        nevent.tags.push(['a', `${event.kind}:${event.author.pubkey}:${event.replaceableDTag()}`]);
        newEvents.forEach((e) => {
          nevent.tags.push(['a', e[1]]);
        });
      }
      eventsToPublish.push(nevent);
    }

    for (let i = 0; i < eventsToPublish.length; i++) {
      await eventsToPublish[i].publish();
    }
    // clear for next time
    cleanUpBookmarksModal();
  }

  function cleanUpBookmarksModal() {
    listsArr = [];
    toggleLists.clear();
    eventsToPublish = [];
    bookmarkModal = false;
  }
  function toggleList(id: string) {
    if (toggleLists.has(id)) toggleLists.delete(id);
    else toggleLists.add(id);
  }


  const firstTag = recipeTags.find(
    (e) => e.title.toLowerCase().replaceAll(' ', '-') == event.getMatchingTags("t").filter((t) => t[1].slice(13)[0])[0][1].slice(13)
  );
</script>

<ZapModal bind:open={zapModal} submit={zapEvt} cancel={() => (zapModal = false)} />

<Modal cleanup={cleanUpBookmarksModal} open={bookmarkModal}>
  <h1 slot="title">Save Recipe</h1>
  <div>
    {#if $userPublickey}
      {#await getLists()}
        Loading your Lists...
      {:then lists}
        <div class="flex flex-col gap-2">
          {#each lists as list, index}
            <div class="flex gap-14 w-full">
              <p class="font-semibold">{list.getMatchingTags('title')[0][1]}</p>
              <input
                class="self-center"
                type="checkbox"
                on:change={() => toggleList(list.replaceableDTag())}
                checked={list
                  .getMatchingTags('a')
                  .find(
                    (t) =>
                      t[1] === `${event.kind}:${event.author.pubkey}:${event.replaceableDTag()}`
                  )
                  ? true
                  : false}
              />
            </div>
            {#if index === 0}
              <hr />
            {/if}
          {/each}
        </div>
      {:catch error}
        An error occurred {error.messsage}
      {/await}
    {:else}
      <a class="underline" href="/login">You must login to add to your bookmarks.</a>
    {/if}
  </div>
  <div class="flex">
    <a href="/list/create" target="_blank" class="text-sm underline grow self-center"
      >Create a New List</a
    >
    <Button
      class="flex"
      on:click={async () => {
        await modifyLists();
        bookmarkModal = false;
      }}>Save</Button
    >
  </div>
</Modal>

<article class="max-w-[760px] mx-auto">
  {#if event}
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-4">
        <h1>
          {event.tags.find((e) => e[0] === 'title')?.[1]
            ? event.tags.find((e) => e[0] === 'title')?.[1]
            : event.tags.find((e) => e[0] === 'd')?.[1]}
        </h1>
        <TagLinks {event} />
        <AuthorProfile pubkey={event.author.pubkey} />
      </div>
      {#each event.tags.filter((e) => e[0] === 'image') as image, i}
        <img class="rounded-3xl aspect-video object-cover" src={image[1]} alt="Image {i + 1}" />
      {/each}
      <div class="flex">
        <div class="flex gap-6 grow">
          <TotalLikes {event} />
          <TotalComments {event} />
          <button class="cursor-pointer" on:click={() => (zapModal = true)}>
            <TotalZaps {event} />
          </button>
        </div>
        <button
          class="cursor-pointer hover:bg-input rounded p-0.5 transition duration-300"
          on:click={() => (dropdownActive = !dropdownActive)}
        >
          <DotsIcon size={24} />
        </button>
        {#if dropdownActive}
          <div class="relative" tabindex="-1" transition:fade={{ delay: 0, duration: 150 }}>
            <button
              on:click={() => (dropdownActive = false)}
              use:clickOutside
              on:click_outside={() => (dropdownActive = false)}
              class="flex flex-col right-0 gap-4 absolute z-20 bg-white rounded-3xl drop-shadow px-5 py-6 my-6"
            >
              {#if event.author.pubkey === $userPublickey}
                <a class="flex gap-2 cursor-pointer" href="/fork/{naddr}">
                  <PencilIcon size={24} />
                  Edit
                </a>
              {/if}
              <button class="flex gap-2 cursor-pointer" on:click={() => (bookmarkModal = true)}>
                <BookmarkIcon size={24} />
                Save
              </button>
            </button>
          </div>
        {/if}
      </div>
      <div class="prose">
        {#if $translateOption.lang}
          {#await translate($translateOption, parseMarkdown(event.content))}
            ...
          {:then result}
            <!-- TODO: clean this up -->
            {#if result !== ''}
              {#if result.from.language.iso === $translateOption.lang}
                {@html parseMarkdown(event.content)}
              {:else}
                <hr />
                <p class="font-medium">
                  Warning: The contents below are translated from <code
                    >{result.from.language.iso}</code
                  >
                  to
                  <code>{$translateOption.lang}</code>
                  <a class="block" href="/settings">open translation setttings</a>
                </p>
                <hr />
                <!-- TODO: FIX SCRIPT INJECTION -->
                {@html result.text}
              {/if}
            {/if}
          {:catch err}
            <p class="font-medium">
              Error loading translation. Error Message: <code>{err}</code>

              <a class="block" href="/settings">open translation setttings</a>
            </p>
          {/await}
        {:else}
          {@html parseMarkdown(event.content)}
        {/if}
      </div>
      <div class="flex flex-col items-center gap-4 bg-input py-6 rounded-3xl">
        <h2>Enjoy this recipe?</h2>
        <Button on:click={() => zapModal = true}>Zap it</Button>
      </div>
      <div class="flex flex-col gap-4">
        {firstTag}
        <h2>More {firstTag[1].split("nostrcooking-")[1]}</h2>
      </div>
      <Comments {event} />
    </div>
  {:else}
    Loading...
  {/if}
</article>
