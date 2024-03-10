<script lang="ts">
  import { ndk } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Fetch } from 'hurdak';

  export let setUrl: (url: string) => void;
  export let name = 'file';
  let input: HTMLElement, listener;
  let url = '';

  $: {
    if (input) {
      input.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        console.log('attempted');
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

<div
  class="flex justify-center bg-input rounded-lg border border-dashed border-[#CCCCCC] px-6 py-10 text-[#1F1D1B]/50"
>
  <div class="text-center">
    <div class="flex gap-0.5 text-sm leading-6 items-center">
      <label
        for="file-upload"
        class="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
      >
        <span class="text-primary">Upload {name}</span>
        <input id="file-upload" bind:this={input} type="file" class="sr-only" />
      </label>
      <p class="pl-1">or drag and drop</p>
    </div>
    <p class="text-xs leading-5">JPG, PNG, WEBP, or GIF</p>
  </div>
</div>
