import plugin from 'tailwindcss/plugin';

const ANIMATION_DURATION = '0.5s';
const ANIMATION_EASING = 'ease-out';

const customAnimations = {
  slideBottom: `slideBottom ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
  slideLeft: `slideLeft ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
  slideRight: `slideRight ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
  zoom: `zoom ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
  fadeInBottom: 'fadeInBottom 1s ease-out',
};

const customKeyframes = {
  slideBottom: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },
  slideLeft: {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },
  slideRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },
  zoom: {
    '0%': { transform: 'scale(0.5)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  },
  fadeInBottom: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  }
};

const animationDelays = {
  '200': '200ms',
  '400': '400ms',
  '600': '600ms',
  '800': '800ms',
  '1000': '1000ms',
};

const fonts = {
  zen: ['Zen Old Mincho', 'serif'],
  prata: ['Prata', 'serif'],
  montserrat: ['Montserrat', 'sans-serif'],
};

const atelierPalette = {
  cream: '#F5EDE4',
  charcoal: '#2B2B2B',
  gold: '#D4A574',
  sage: '#9CAF88',
  blush: '#E8C5B8',
  stone: '#8B8680',
  mist: '#E0DDD9',
  dust: '#F9F7F5',
};

const animationDelayPlugin = plugin(function({ matchUtilities, theme }) {
  matchUtilities(
    {
      'animation-delay': (value) => ({
        'animation-delay': value,
      }),
    },
    { values: theme('animationDelay') }
  );
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      animation: customAnimations,
      keyframes: customKeyframes,
      animationDelay: animationDelays,
      fontFamily: fonts,
      colors: {
        atelier: atelierPalette
      }
    },
  },
  plugins: [animationDelayPlugin],
}