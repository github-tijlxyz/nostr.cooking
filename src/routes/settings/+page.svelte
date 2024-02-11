<script lang="ts">
  import { browser } from '$app/environment';
  import { standardRelays } from '$lib/consts';
  import { translateOption } from '$lib/state';
  import Login from '../../components/Login.svelte';
  import Fa from 'svelte-fa';
  import { faTrashCan, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
  import Button from '../../components/Button.svelte';

  let relays: string[] = [];
  let newRelay = '';
  let translation = '';
  let translationLanguage = '';
  let translationOption = '';

  function removeRelay(index: number) {
    relays.splice(index, 1);
    relays = [...relays];
  }

  function addRelay() {
    if (newRelay) {
      relays.push(newRelay);
      newRelay = '';
      relays = [...relays];
    }
  }

  function saveData() {
    addRelay();
    if (translation !== '' && translationLanguage !== '') {
      if (translation == 'google' && translationOption == '') {
        translationOption = 'https://corsproxy.io/?';
      }
      if (translation == 'libretranslate' && translationOption == '') {
        translationOption = 'https://libretranslate.de';
      }
      localStorage.setItem(
        'nostrcooking_translationOptions',
        JSON.stringify({ option: translation, lang: translationLanguage, data: translationOption })
      );
    } else {
      localStorage.removeItem('nostrcooking_translationOptions');
    }
    if (relays !== standardRelays) {
      localStorage.setItem('nostrcooking_relays', JSON.stringify(relays));
    }
    setTimeout(() => {
      window.location.href = '';
    }, 1);
  }

  if (browser) {
    const a = localStorage.getItem('nostrcooking_relays');
    if (a) {
      relays = JSON.parse(a);
    } else {
      relays = standardRelays;
    }
    translation = $translateOption.option;
    translationLanguage = $translateOption.lang;
    translationOption = $translateOption.data;
  }
</script>

<svelte:head>
  <title>nostr.cooking settings</title>
</svelte:head>

<div class="flex flex-col gap-5">
  <h1>Settings</h1>
  <div class="flex flex-col gap-4">
    <h2>Relays</h2>
    <div class="flex flex-col gap-2">
      {#each relays as relay, index}
        <div class="flex bg-[#F6F6F6] p-3 rounded-xl">
          <span class="grow">{relay}</span>
          <button class="self-center text-[#FF3535]" on:click={() => removeRelay(index)}>
            <Fa icon={faTrashCan} />
          </button>
        </div>
      {/each}
      <div class="flex gap-4 mx-0.5">
        <input
          bind:value={newRelay}
          placeholder="wss://relay.example.com"
          class="flex p-3 bg-[#F6F6F6] rounded-xl border-none"
        />
        <Button on:click={addRelay} primary={false}>Add</Button>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-4">
    <h2>Translation</h2>
    <div class="flex flex-col mx-0.5 gap-4">
      <select
        bind:value={translation}
        class="flex p-3 bg-[#F6F6F6] rounded-xl border-none"
      >
        <option value="">Disabled</option>
        <option value="google">Google Translate (with proxy)</option>
        <!--<option value="libretranslate">Libretranslate Instance</option>-->
      </select>
      {#if translation !== ''}
        <input
          bind:value={translationLanguage}
          placeholder="2 letter language code, like: 'en', 'es', 'fr' ect"
          class="flex p-3 bg-[#F6F6F6] rounded-xl border-none"
        />
        <input
          bind:value={translationOption}
          placeholder={(translation == 'google'
              ? 'set CORS proxy url,'
              : translation == 'libretranslate'
              ? 'libretranslate instance url,'
              : '') + ' leave blank for default'}
          class="flex p-3 bg-[#F6F6F6] rounded-xl border-none"
        />
      {/if}
    </div>
    {#if translation !== ''}
      Warning: You may leak data to third parties while using this.
    {/if}
  </div>

  <Button on:click={saveData}>Save</Button>
  <hr />

  <div class="flex flex-col gap-5">
    <h2>Danger</h2>
    <Button class="flex bg-[#FF3535] self-start gap-2" primary={false} on:click={() => (window.location.href = '/clearall')}>
      <Fa class="self-center" icon={faTriangleExclamation} />
      Clear all data
    </Button>
  </div>
</div>
