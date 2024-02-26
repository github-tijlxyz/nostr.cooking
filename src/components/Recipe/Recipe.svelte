<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import TagLinks from './TagLinks.svelte';
  import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
  import { ndk, userPublickey } from '$lib/nostr';
  import {
    faBoltLightning,
    faGear,
    faRightFromBracket,
    faUser,
    faWallet
  } from '@fortawesome/free-solid-svg-icons';
  import Button from '../Button.svelte';
  import Fa from 'svelte-fa';
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
  import { goto } from '$app/navigation';
  import { clickOutside } from '$lib/clickOutside';
  import AuthorProfile from '../AuthorProfile.svelte';

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
          const res = await webln.sendPayment(a);
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
</script>

{#if zapModal}
  <ZapModal submit={zapEvt} cancel={() => (zapModal = false)} />
{/if}

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
                    (t) => t[1] == `${event.kind}:${event.author.pubkey}:${event.replaceableDTag()}`
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
        <img class="rounded-3xl aspect-video" src={image[1]} alt="Image {i + 1}" />
      {/each}
      <div class="flex">
        <div class="flex gap-6 grow">
          <TotalLikes {event} />
          <TotalComments {event} />
          <div class="cursor-pointer" on:click={() => (zapModal = true)}>
            <TotalZaps {event} />
          </div>
        </div>
        <div class="cursor-pointer" on:click={() => (dropdownActive = !dropdownActive)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        {#if dropdownActive}
          <div class="relative">
            <div
              on:click={() => (dropdownActive = false)}
              use:clickOutside
              on:click_outside={() => (dropdownActive = false)}
              class="flex flex-col right-0 gap-4 absolute z-20 bg-white rounded-3xl drop-shadow px-5 py-6 my-6"
            >
              {#if event.author.pubkey === $userPublickey}
                <a class="flex gap-2 cursor-pointer" href="/fork/{naddr}">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 10.0001L14 6.00006M2.5 21.5001L5.88437 21.124C6.29786 21.0781 6.5046 21.0551 6.69785 20.9925C6.86929 20.937 7.03245 20.8586 7.18289 20.7594C7.35245 20.6476 7.49955 20.5005 7.79373 20.2063L21 7.00006C22.1046 5.89549 22.1046 4.10463 21 3.00006C19.8955 1.89549 18.1046 1.89549 17 3.00006L3.79373 16.2063C3.49955 16.5005 3.35246 16.6476 3.24064 16.8172C3.14143 16.9676 3.06301 17.1308 3.00751 17.3022C2.94496 17.4955 2.92198 17.7022 2.87604 18.1157L2.5 21.5001Z"
                      stroke="black"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Edit
                </a>
              {/if}
              <div class="flex gap-2 cursor-pointer" on:click={() => (bookmarkModal = true)}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
                    stroke="black"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Save
              </div>
            </div>
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
              {#if result.from.language.iso == $translateOption.lang}
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
      <Comments {event} />
    </div>
  {:else}
    Loading...
  {/if}
</article>
