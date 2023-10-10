<script lang="ts">
  import { ndk } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Fetch } from 'hurdak';

  export let setUrl: (url: string) => void;
  let input: HTMLElement, listener;
  let url = '';

  $: {
    if (input) {
      input.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;

        if (target.files && target.files?.length > 0) {
          const body = new FormData();
          body.append('file[]', target.files[0]);
          const result = await uploadToNostrBuild(body);
          console.log(result);
          if (result && result.data && result.data[0].url) {
            setUrl(result.data[0].url);
            url = result.data[0].url;
          }
        }
      });
    }
  }

  export async function uploadToNostrBuild(body: any) {
    const url = 'https://nostr.build/api/v2/upload/files';
    const template = new NDKEvent($ndk);
    template.kind = 27235;
    template.content = '';
    template.tags = [
      ['u', url],
      ['method', 'POST']
    ];

    template.sign();

    return Fetch.fetchJson(url, {
      body,
      method: 'POST',
      headers: {
        Authorization: `Nostr ${btoa(JSON.stringify(event))}`
      }
    });
  }
</script>

<div class="col-span-full">
  {#if url == ''}
    <div
      class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
    >
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-300"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="mt-4 flex text-sm leading-6 text-gray-600">
          <label
            for="file-upload"
            class="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
          >
            <span>Upload a file</span>
            <input id="file-upload" bind:this={input} type="file" class="sr-only" />
          </label>
          <p class="pl-1">or drag and drop</p>
        </div>
        <p class="text-xs leading-5 text-gray-600">JPG, PNG, WEBP, or GIF</p>
      </div>
    </div>
  {:else}
    <img src={url} alt="uploaded image" />
  {/if}
</div>
