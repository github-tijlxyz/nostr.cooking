<script lang="ts">
  import Fa from 'svelte-fa';
  import { faKey } from '@fortawesome/free-solid-svg-icons';
  import Button from '../../components/Button.svelte';
</script>

<svelte:head>
  <title>login to nostr.cooking</title>
</svelte:head>

<div class="flex flex-col gap-8 justify-center items-center text-center">
  <div class="flex flex-col gap-6">
    <div class="text-3xl font-semibold">Sign in</div>
    <div class="flex flex-col gap-4">
      <span class="font-semibold">Use a browser extension to sign in</span>
      <button
        class="flex w-[320px] h-[52px] gap-2 shadow rounded-xl justify-center text-center font-semibold border box-border border-[#D1D3DC]"
      >
        <span
          class="flex justify-center items-center rounded-full bg-[#FA9101] self-center w-10 h-10 text-white"
        >
          <Fa class="text-xl" icon={faKey} />
        </span>
        <span class="self-center">Sign in with extension</span>
      </button>
    </div>
  </div>
  <div class="flex flex-col font-semibold gap-3">
    Don't have an account?
    <Button class="self-center" primary={false}>Sign up</Button>
  </div>
</div>
