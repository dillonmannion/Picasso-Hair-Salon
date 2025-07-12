<script lang="ts">
  import ImageOverlay from './ImageOverlay.svelte';
  import AnimatedElement from './AnimatedElement.svelte';

  interface Service {
    id: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    icon?: string;
  }

  interface Props {
    services: Service[];
    class?: string;
  }

  const { services, class: className = '' }: Props = $props();
  
  const ANIMATION_STAGGER_DELAY = 100;
</script>

<div role="grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 {className}">
  {#each services as service, index (service.id)}
    <AnimatedElement animation="fly" delay={index * ANIMATION_STAGGER_DELAY} class="h-full">
      <article class="bg-white h-full flex flex-col overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
        <ImageOverlay 
          src={service.image} 
          alt={service.imageAlt}
          icon={service.icon}
          class="aspect-[4/3] w-full"
        />
        
        <div class="p-6 flex-grow">
          <h3 class="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
          <p class="text-gray-600 leading-relaxed">{service.description}</p>
        </div>
      </article>
    </AnimatedElement>
  {/each}
</div>