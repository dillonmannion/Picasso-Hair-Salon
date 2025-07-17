<script lang="ts">
  import { onMount } from 'svelte';

  const STORAGE_KEYS = {
    fontSize: 'a11y-font-size',
    highContrast: 'a11y-high-contrast',
    underlineLinks: 'a11y-underline-links'
  } as const;

  const FONT_SIZE_CONFIG = {
    min: 75,
    max: 150,
    step: 12.5,
    default: 100
  } as const;

  const CSS_CLASSES = {
    highContrast: 'high-contrast',
    underlineLinks: 'always-underline-links'
  } as const;

  let fontSize = $state<number>(FONT_SIZE_CONFIG.default);
  let highContrast = $state(false);
  let underlineLinks = $state(false);

  const canIncreaseFontSize = $derived(fontSize < FONT_SIZE_CONFIG.max);
  const canDecreaseFontSize = $derived(fontSize > FONT_SIZE_CONFIG.min);

  const applyFontSize = () => {
    document.documentElement.style.fontSize = 
      fontSize === FONT_SIZE_CONFIG.default ? '' : `${fontSize}%`;
  };

  const applyClassToggle = (className: string, isEnabled: boolean) => {
    document.body.classList.toggle(className, isEnabled);
  };

  const savePreference = (key: string, value: string | null) => {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = fontSize + delta;
    
    if (newSize >= FONT_SIZE_CONFIG.min && newSize <= FONT_SIZE_CONFIG.max) {
      fontSize = newSize;
      savePreference(STORAGE_KEYS.fontSize, fontSize.toString());
      applyFontSize();
    }
  };

  const toggleFeature = (
    featureName: 'highContrast' | 'underlineLinks',
    className: string
  ) => {
    const newValue = featureName === 'highContrast' 
      ? !highContrast 
      : !underlineLinks;
    
    if (featureName === 'highContrast') {
      highContrast = newValue;
    } else {
      underlineLinks = newValue;
    }
    
    applyClassToggle(className, newValue);
    savePreference(STORAGE_KEYS[featureName], newValue ? 'true' : null);
  };

  const loadPreferences = () => {
    const savedFontSize = localStorage.getItem(STORAGE_KEYS.fontSize);
    const savedHighContrast = localStorage.getItem(STORAGE_KEYS.highContrast);
    const savedUnderlineLinks = localStorage.getItem(STORAGE_KEYS.underlineLinks);

    if (savedFontSize) {
      fontSize = parseFloat(savedFontSize);
      applyFontSize();
    }

    if (savedHighContrast === 'true') {
      highContrast = true;
      applyClassToggle(CSS_CLASSES.highContrast, true);
    }

    if (savedUnderlineLinks === 'true') {
      underlineLinks = true;
      applyClassToggle(CSS_CLASSES.underlineLinks, true);
    }
  };

  const resetSettings = () => {
    fontSize = FONT_SIZE_CONFIG.default;
    highContrast = false;
    underlineLinks = false;

    applyFontSize();
    applyClassToggle(CSS_CLASSES.highContrast, false);
    applyClassToggle(CSS_CLASSES.underlineLinks, false);

    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  };

  onMount(() => {
    loadPreferences();
  });
</script>

<div 
  role="toolbar" 
  aria-label="Accessibility controls"
  class="accessibility-toolbar"
>
  <div role="group" aria-label="Font size" class="control-group">
    <button
      onclick={() => changeFontSize(-FONT_SIZE_CONFIG.step)}
      aria-label="Decrease font size"
      tabindex="0"
      class="control-button"
      disabled={!canDecreaseFontSize}
    >
      A-
    </button>
    <button
      onclick={() => changeFontSize(FONT_SIZE_CONFIG.step)}
      aria-label="Increase font size"
      tabindex="0"
      class="control-button"
      disabled={!canIncreaseFontSize}
    >
      A+
    </button>
  </div>

  <button
    onclick={() => toggleFeature('highContrast', CSS_CLASSES.highContrast)}
    aria-label="Toggle high contrast"
    aria-pressed={highContrast}
    tabindex="0"
    class="control-button"
    class:active={highContrast}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
    </svg>
  </button>

  <button
    onclick={() => toggleFeature('underlineLinks', CSS_CLASSES.underlineLinks)}
    aria-label="Toggle link underlines"
    aria-pressed={underlineLinks}
    tabindex="0"
    class="control-button"
    class:active={underlineLinks}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 3V8C8 10.21 9.79 12 12 12S16 10.21 16 8V3H18V8C18 11.31 15.31 14 12 14S6 11.31 6 8V3H8M4 20H20V22H4V20Z"/>
    </svg>
  </button>

  <button
    onclick={resetSettings}
    aria-label="Reset accessibility settings"
    tabindex="0"
    class="control-button"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 8C9.85 8 7.45 9 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.22C21.08 11.03 17.15 8 12.5 8Z"/>
    </svg>
  </button>
</div>

<style>
  .accessibility-toolbar {
    position: fixed;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-button {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
    color: #374151;
  }

  .control-button:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .control-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  :global(.high-contrast) {
    filter: contrast(1.5);
  }

  :global(.high-contrast *) {
    border-color: currentColor !important;
  }

  :global(.always-underline-links a) {
    text-decoration: underline !important;
  }
</style>