<script lang="ts">
  import type { PageData } from './$types';
  import Header from '$lib/components/Header.svelte';
  import HeroSection from '$lib/components/HeroSection.svelte';
  import ServiceGrid from '$lib/components/ServiceGrid.svelte';
  import MasonryGallery from '$lib/components/MasonryGallery.svelte';
  import ScrollToTop from '$lib/components/ScrollToTop.svelte';
  import Container from '$lib/components/Container.svelte';
  import Typography from '$lib/components/Typography.svelte';
  import AnimatedElement from '$lib/components/AnimatedElement.svelte';
  import { onMount } from 'svelte';
  import { initSmoothScroll } from '$lib/utils/smooth-scroll';
  import { mockServices, mockGalleryImages } from '$lib/data/mock-data';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { data } = $props<{ data: PageData }>();

  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' }
  ];

  const services = mockServices;
  const galleryImages = mockGalleryImages;

  onMount(() => {
    return initSmoothScroll();
  });
</script>

<div data-testid="page-container" class="min-h-screen">
  <Header navItems={navItems} brandName="Picasso Hair Salon" />
  
  <main>
    <HeroSection
      title="Picasso Hair Salon"
      subtitle="Where Artistry Meets Elegance"
      ctaText="Book Your Experience"
      ctaHref="#services"
      backgroundImage="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80"
    />

    <section id="services" aria-label="Services" class="py-20">
      <Container>
        <AnimatedElement animation="fade" delay={200}>
          <Typography variant="display" class="mb-12 text-center" data-testid="typography">
            Our Services
          </Typography>
        </AnimatedElement>
        <ServiceGrid services={services} />
      </Container>
    </section>

    <section id="gallery" aria-label="Gallery" class="py-20 bg-atelier-100">
      <Container>
        <AnimatedElement animation="fade" delay={200}>
          <Typography variant="display" class="mb-12 text-center" data-testid="typography">
            Our Work
          </Typography>
        </AnimatedElement>
        <MasonryGallery images={galleryImages} />
      </Container>
    </section>

    <section id="contact" aria-label="Contact" class="py-20">
      <Container size="narrow">
        <AnimatedElement animation="fade" delay={200}>
          <Typography variant="display" class="mb-8 text-center" data-testid="typography">
            Visit Us
          </Typography>
          <div class="text-center space-y-4">
            <Typography variant="body">
              123 Artisan Boulevard<br />
              New York, NY 10001
            </Typography>
            <Typography variant="body">
              <a href="tel:+12125551234" class="hover:text-atelier-600 transition-colors">
                (212) 555-1234
              </a>
            </Typography>
            <Typography variant="body">
              Open Tuesday - Saturday<br />
              10:00 AM - 8:00 PM
            </Typography>
          </div>
        </AnimatedElement>
      </Container>
    </section>
  </main>

  <ScrollToTop />
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>