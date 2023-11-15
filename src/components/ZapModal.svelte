<script lang="ts">
  import { formatAmount } from '$lib/utils';
  import Pill from './Pill.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  export let submit: (amount: number, message: string) => void;

  //const defaultZapUSDAmounts = [0.05, 0.5, 2, 5, 10, 21, 50, 100, 200];
  const defaultZapSatsAmounts = [
    21, 69, 121, 420, 1000, 2100, 4200, 10000, 21000, 42000, 69000, 100000, 210000, 500000, 1000000
  ];

  let selectedCurrency: 'SATS' | 'USD' = 'SATS';

  let openCustom: boolean = true;
  let amount: number = 21;
  let message: string = '';

  function submitNow() {
    submit(amount, message);
  }

  export let open;
</script>

<Dialog.Root bind:open={$open}> 
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header> 
            <Dialog.Title>Zap</Dialog.Title>
        </Dialog.Header>


          <div> 
              <label class="text-sm text-gray-800">Amount (SATS)</label>
              <div class="gap-2 grid-cols-4">
                {#if selectedCurrency == 'SATS'}
                  {#each defaultZapSatsAmounts as zapPamount, i}
                    <Pill
                      selected={amount == zapPamount}
                      text={formatAmount(zapPamount)}
                      onClick={() => (amount = zapPamount)}
                    />
                  {/each}
                {/if}
                <!-- add usd? -->
              </div>

              <div class="my-4">
                <Input
                  bind:value={amount}
                  type="number"
                />
              </div>

      <Dialog.Footer> 
        <Button on:click={submitNow} type="submit">Zap</Button>
      </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<!--
<div
  class="fixed z-[299] inset-0 overflow-y-hidden"
  aria-labelledby="modal"
  role="dialog"
  aria-modal="true"
>
  <div
    class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
  >
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" />
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
      >&#8203;</span
    >
    <div
      class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
    >
      <div class="sm:flex sm:items-start">
        <div
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 text-yellow-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Zap</h3>
          <div class="mt-2">-->
            <!--Choose amount-->

            <!-- choose curreny -->
            <!-- <div class="mt-2 mb-1">
                    <label class="text-sm text-gray-800 mb-1">Currency</label>
                    <div class="flex gap-2">
                        <Pill selected={selectedCurrency == "SATS"} text={"SATS"} onClick={() => selectedCurrency = "SATS"} />
                        <Pill selected={selectedCurrency == "USD"} text={"USD"} onClick={() => selectedCurrency = "USD"} />
                    </div>
                </div> -->

            <!--<div class="mt-2 mb-1">
              <label class="text-sm text-gray-800">Amount (SATS)</label>
              <div class="gap-2 grid-cols-4">
                {#if selectedCurrency == 'SATS'}
                  {#each defaultZapSatsAmounts as zapPamount, i}
                    <Pill
                      selected={amount == zapPamount}
                      text={formatAmount(zapPamount)}
                      onClick={() => (amount = zapPamount)}
                    />
                  {/each}
                {/if}-->
                <!-- add usd? -->
              <!--</div>
              {#if openCustom}
                <input
                  bind:value={amount}
                  type="number"
                  class="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              {/if}
            </div>-->

            <!--Add mesage?-->
            <!--<div class="mt-2 mb-1">
              <label class="text-sm text-gray-800">Add a message (optional)</label>
              <input
                bind:value={message}
                type="text"
                class="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          on:click={submitNow}
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
          >Zap</button
        >
        <button
          on:click={cancel}
          type="button"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          >Cancel</button
        >
      </div>
    </div>
  </div>
</div>-->
