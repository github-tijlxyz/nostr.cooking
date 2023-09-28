<script lang="ts">
  import { browser } from '$app/environment';
  import { standardRelays } from '$lib/consts';
  import { translateOption } from '$lib/state';

  let relays: string[] = [];
  let newRelay = '';
  let translation = '';
  let translationLanguage = '';

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
      localStorage.setItem(
        'nostrcooking_translationOptions',
        JSON.stringify({ option: translation, lang: translationLanguage })
      );
    } else {
      localStorage.removeItem('nostrcooking_translationOptions');
    }
    localStorage.setItem('nostrcooking_relays', JSON.stringify(relays));
    setTimeout(() => {
      window.location.href = '';
    }, 1);
  }

  if (browser) {
    relays = JSON.parse(
      localStorage.getItem('nostrcooking_relays') || JSON.stringify(standardRelays)
    );
    translation = $translateOption.option;
    translationLanguage = $translateOption.lang;
  }
</script>

<div class="font-sans mx-auto p-2 lg:max-w-4xl">
  <div class="prose">
    <h1 class="mt-0">Settings</h1>
  </div>

  <!-- Relay Selection -->
  <div class="my-6">
    <p class="text-sm">Relays</p>
    {#each relays as relay, index}
      <div class="border rounded-full pl-2 my-1">
        <button
          class="text-red-500 py-0.5 px-1.5 rounded-full text-xl font-medium"
          on:click={() => removeRelay(index)}
        >
          x
        </button>
        {relay}
      </div>
    {/each}
    <div class="flex">
      <input
        bind:value={newRelay}
        type="text"
        class="inline mr-0 rounded-md rounded-r-none shadow-sm focus:ring-blue-300 focus:border-blue-300 sm:text-sm border-gray-400"
        placeholder="wss://relay.example.com"
      />
      <button
        on:click={addRelay}
        type="button"
        class="inline-flex ml-0 rounded-md rounded-l-none border-blue-300 items-center px-2.5 py-1.5 border text-sm font-medium shadow-sm text-black bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
        >Add</button
      >
    </div>
  </div>

  <!-- Translation -->
  <div class="my-6">
    <p class="text-sm">Translation (exprimental)</p>
    <div>
      <select
        bind:value={translation}
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-sm rounded-md"
      >
        <option value="">Disabled</option>
        <option value="google">Google Translate (with proxy)</option>
      </select>
      {#if translation !== ''}
        <input
          bind:value={translationLanguage}
          placeholder="2 letter language code, like: 'en', 'es', 'fr' ect"
          class="shadow-sm focus:ring-blue-300 focus:border-blue-300 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      {/if}
    </div>
    {#if translation !== ''}
      <p class="mt-2">Warning: You may leak data to thierd parties while using this.</p>
    {/if}
  </div>

  <!-- Save button -->
  <button
    on:click={saveData}
    type="button"
    class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-black bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
  >
    Save & Reload
  </button>
</div>
