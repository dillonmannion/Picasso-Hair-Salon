<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
  }

  let { variant = 'primary', size = 'medium', children, ...restProps }: Props = $props();

  let className = $derived(`button button--${variant} button--${size}`);
</script>

<button class={className} {...restProps}>
  {@render children?.()}
</button>

<style>
  .button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .button--primary {
    background: #007bff;
    color: white;
  }

  .button--primary:hover {
    background: #0056b3;
  }

  .button--secondary {
    background: #6c757d;
    color: white;
  }

  .button--secondary:hover {
    background: #545b62;
  }

  .button--danger {
    background: #dc3545;
    color: white;
  }

  .button--danger:hover {
    background: #c82333;
  }

  .button--small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .button--medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .button--large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
