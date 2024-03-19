<script lang="ts">
  import Modal from './Modal.svelte';
  import { formatAmount } from '$lib/utils';
  import Pill from './Pill.svelte';
  import Button from './Button.svelte';

  export let submit: (amount: number, message: string) => void;
  export let cancel: () => void;

  //const defaultZapUSDAmounts = [0.05, 0.5, 2, 5, 10, 21, 50, 100, 200];
  const defaultZapSatsAmounts = [
    21, 121, 400, 1000, 2100, 4200, 10000, 21000, 42000, 69000, 100000, 210000, 500000, 1000000
  ];

  let selectedCurrency: 'SATS' | 'USD' = 'SATS';

  export let open = false;
  let amount: number = 21;
  let message: string = '';

  function submitNow() {
    submit(amount, message);
  }
</script>

<Modal bind:open>
  <h1 slot="title">Zap</h1>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-3">
      <div class="grid grid-cols-7 grid-rows-2 gap-2">
        {#if selectedCurrency == 'SATS'}
          {#each defaultZapSatsAmounts as zapPamount}
            <Pill
              selected={amount == zapPamount}
              text={formatAmount(zapPamount)}
              onClick={() => (amount = zapPamount)}
            />
          {/each}
        {/if}
      </div>
      <input type="text" class="input" bind:value={amount} />
      <textarea rows="2" class="input" bind:value={message} placeholder="Message (optional)" />
    </div>
    <div class="flex gap-2 justify-end">
      <Button
        class="!text-black bg-white border border-[#ECECEC] hover:bg-accent-gray"
        on:click={cancel}>Cancel</Button
      >
      <Button on:click={submitNow}>Zap</Button>
    </div>
  </div>
</Modal>
