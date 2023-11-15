<script>
  import { onMount } from 'svelte';
  import '../app.postcss';
  import { browser } from '$app/environment';
  import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import { ndk, userPublickey } from '$lib/nostr';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';
  import { Menu, Sun, Moon } from 'lucide-svelte';
  import { ModeWatcher, toggleMode } from 'mode-watcher';

  async function login() {
    if (browser) {
      if (!$ndk.signer) {
        try {
          const signer = new NDKNip07Signer();
          $ndk.signer = signer;
          ndk.set($ndk);
        } catch (err) {}
      }
      if (!$ndk.signer) {
        try {
          const pk = localStorage.getItem('nostrcooking_privateKey');
          if (pk) {
            const signer = new NDKPrivateKeySigner(pk);
            $ndk.signer = signer;
            ndk.set($ndk);
          }
        } catch (err) {}
      }
      if ($ndk.signer && $userPublickey == '') {
        const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
        localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
        $userPublickey = newUserPublicKey;
        userPublickey.set($userPublickey);
      }
      if ($ndk.signer) {
        console.log('signer activated');
      }
    }
  }

  onMount(() => {
    setTimeout(async () => {
      await login();
    }, 5);
  });

  let menuOpen = false;
</script>

<svelte:head />

<ModeWatcher />

<div class="relative flex min-h-screen flex-col">
	<div
		class="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur"
	>
		<div class="container flex h-14 items-center">

			<div class="mr-4">

                <div class="md:hidden">
                    <Sheet.Root bind:open={menuOpen}>
                        <Sheet.Trigger>
                            <div class="flex flex-1 items-center space-x-2 sm:space-x-4 justify-end">
                                <Button variant="ghost" size="icon">
                                    <Menu />
                                </Button>
                            </div>
                        </Sheet.Trigger>
                        <Sheet.Content side="left">
                            <div class="text-foreground/60 flex items-center">
                            <Sheet.Header>
                                <Sheet.Title>nostr.cooking</Sheet.Title>
                            </Sheet.Header>
                            </div>
                            <div class="grid gap-4 py-4">
                            <div class="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-auto">
                            <div on:click={() => menuOpen = false} class="flex flex-col space-y-3 text-foreground/60">
                                <div><a href="/recent">Recent Articles</a></div>
                                {#if $userPublickey !== ""}
                                <div><a href="/bookmarks">Bookmarks</a></div>
                                <div><a href="/create">Create Recipe</a></div>
                                <div><a href="/">My Profile</a></div>
                                {/if}
                                <div><a href="/settings">Settings</a></div>
                            </div>
                            </div>
                            </div>
                        </Sheet.Content>
                    </Sheet.Root>
                </div>

                <div class="hidden md:flex flex-1 items-center space-x-2 sm:space-x-4 justify-end">
                    <a class="transition-colors hover:text-foreground/80 text-foreground/60" href="/recent">Recent Articles</a>
                    {#if $userPublickey !== ""}
                    <a class="transition-colors hover:text-foreground/80 text-foreground/60" href="/bookmarks">Bookmarks</a>
                    <a class="transition-colors hover:text-foreground/80 text-foreground/60" href="/create">Create Recipe</a>
                    <a class="transition-colors hover:text-foreground/80 text-foreground/60" href="/">My Profile</a>
                    {/if}
                    <a class="transition-colors hover:text-foreground/80 text-foreground/60" href="/settings">Settings</a>
                </div>
			</div>

            <div class="flex flex-1 items-center space-x-2 sm:space-x-4 justify-end">
				<Button on:click={toggleMode} variant="ghost" size="icon">
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
            </div>
		</div>
	</div>
    <div class="mx-8 my-2">
        <slot />
    </div>
</div>

