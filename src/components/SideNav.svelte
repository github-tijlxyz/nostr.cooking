<script>
  import { goto } from '$app/navigation';
  import { userPublickey } from '$lib/nostr';
  import { nip19 } from 'nostr-tools';
  import SVGNostrCookingWithText from '../assets/nostr.cooking-withtext.svg';
</script>

<div class="m-4 hidden md:block w-3/12 rounded-xl min-w-[256px] bg-gray-50 px-4 py-2">
  <div class="w-full">
    <img
      src={SVGNostrCookingWithText}
      class="h-full w-full my-3"
      alt="Nostr.Cooking Logo With Text"
    />
    <button
      on:click={() => goto('/recent')}
      class="px-3 py-3 bg-white border border-gray-300 hover:bg-slate-50 rounded-lg mt-2 w-full"
    >
      <div class="text-left font-medium">
        <svg
          class="inline w-6 h-6 mr-1"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          /></svg
        >
        <span>Recent</span>
      </div>
    </button>
    {#if $userPublickey !== ''}
      <button
        class="px-3 py-3 bg-white border border-gray-300 hover:bg-slate-50 rounded-lg mt-2 w-full"
        on:click={() => goto(`/bookmarks`)}
      >
        <div class="text-left font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="inline w-6 h-6 mr-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
          <span>Bookmarks</span>
        </div>
      </button>
      <button
        on:click={() => goto('/create')}
        class="px-3 py-3 bg-white border border-gray-300 hover:bg-slate-50 rounded-lg mt-2 w-full"
      >
        <div class="text-left font-medium">
          <svg
            class="inline w-6 h-6 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          <span>Create Recipe</span>
        </div>
      </button>
      <button
        on:click={() => goto(`/user/${nip19.npubEncode($userPublickey)}`)}
        class="px-3 py-3 bg-white border border-gray-300 hover:bg-slate-50 rounded-lg mt-2 w-full"
      >
        <div class="text-left font-medium">
          <svg
            class="inline w-6 h-6 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            /></svg
          >
          <span>My Profile</span>
        </div>
      </button>
    {/if}
    <button
      on:click={() => goto('/settings')}
      class="px-3 py-3 bg-white border border-gray-300 hover:bg-slate-50 rounded-lg mt-2 w-full"
    >
      <div class="text-left font-medium">
        <svg
          class="inline w-6 h-6 mr-1"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
          /><path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          /></svg
        >
        <span>Settings</span>
      </div>
    </button>
    <!--
    {#if $userPublickey == ''}
      <button
        on:click={() => goto('/login')}
        class="px-3 py-3 bg-blue-50 border border-blue-300 hover:bg-blue-100 rounded-lg mt-2 w-full"
      >
        <div class="text-center font-medium">
          <span>Login</span>
        </div>
      </button>
    {:else}
      <button
        on:click={() => goto('/login')}
        class="px-3 py-3 bg-blue-50 border border-blue-300 hover:bg-blue-100 rounded-lg mt-2 w-full"
      >
        <div class="text-center font-medium">
          <span>Logout</span>
        </div>
      </button>
    {/if}
    -->
  </div>
  <hr class="my-4" />
  <div class="text-center w-full text-sm">
    <!-- <img
    src={SVGNostrCookingWithText}
    class="h-full w-full mb-[-1.25rem] mt-[-0.25rem]"
    alt="Nostr.Cooking Logo With Text"
  /> -->
    <p>
      <a
        class="hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://nostr.cooking">NOSTR.COOKING</a
      >
    </p>
    <p>
      open source on <a
        class="hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/github-tijlxyz/nostr.cooking">github</a
      >
    </p>
  </div>
</div>
