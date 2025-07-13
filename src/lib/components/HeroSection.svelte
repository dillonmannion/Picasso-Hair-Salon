<script lang="ts">
  import AnimatedElement from './AnimatedElement.svelte';
  import Button from './Button.svelte';
  import Typography from './Typography.svelte';
  
  interface Props {
    backgroundImage: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    parallax?: boolean;
  }
  
  let { backgroundImage, title, subtitle, ctaText, ctaHref, parallax = false }: Props = $props();
</script>

<section class="relative h-screen overflow-hidden" aria-label="Hero section" data-testid="hero-section">
  <div class="absolute inset-0" {...(parallax && { 'data-parallax': 'true' })}>
    <img 
      src={backgroundImage} 
      alt="Hero background"
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
  </div>
  
  <div class="relative h-full flex items-center justify-center">
    <div class="text-center text-white px-4 md:px-8">
      <AnimatedElement animation="fade" delay={0}>
        <Typography variant="hero" class="mb-4 text-white">
          {title}
        </Typography>
      </AnimatedElement>
      
      <AnimatedElement animation="fade" delay={200}>
        <Typography variant="heading" class="mb-8 text-white font-light">
          {subtitle}
        </Typography>
      </AnimatedElement>
      
      <AnimatedElement animation="fade" delay={400}>
        <Button variant="primary" href={ctaHref}>
          {ctaText}
        </Button>
      </AnimatedElement>
    </div>
  </div>
</section>