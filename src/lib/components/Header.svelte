<script lang="ts">
  type NavItem = {
    label: string;
    href: string;
  };

  type Props = {
    navItems?: NavItem[];
    brandName?: string;
  };

  let { navItems = [], brandName = '' }: Props = $props();

  let isScrolled = $state(false);
  let isMobileMenuOpen = $state(false);

  const handleScroll = () => {
    isScrolled = window.scrollY > 0;
  };

  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen = false;
  };

  const handleOverlayKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  };

  $effect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {isScrolled ? 'bg-atelier-cream shadow-md' : 'bg-transparent'}"
>
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      {#if brandName}
        <a href="/" class="text-xl font-semibold hover:text-atelier-gold transition-colors">
          {brandName}
        </a>
      {/if}

      <nav aria-label="desktop navigation" class="hidden md:block">
        <ul class="flex space-x-8">
          {#each navItems as item (item.href)}
            <li>
              <a href={item.href} class="hover:text-atelier-gold transition-colors">
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <button
        onclick={toggleMobileMenu}
        aria-label="Menu"
        class="md:hidden p-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</header>

<button
  type="button"
  data-testid="mobile-menu-overlay"
  class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden {isMobileMenuOpen ? 'block' : 'hidden'} cursor-default"
  onclick={closeMobileMenu}
  onkeydown={handleOverlayKeydown}
  aria-label="Close mobile menu"
  tabindex={isMobileMenuOpen ? 0 : -1}
></button>

<div
  data-testid="mobile-menu"
  class="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 {isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}"
>
  <div class="p-6">
    <button
      onclick={closeMobileMenu}
      aria-label="Close menu"
      class="absolute top-4 right-4"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <nav aria-label="mobile navigation" class="mt-8">
      <ul class="space-y-4">
        {#each navItems as item (item.href)}
          <li>
            <a
              href={item.href}
              onclick={closeMobileMenu}
              class="block py-2 hover:text-atelier-gold transition-colors"
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</div>