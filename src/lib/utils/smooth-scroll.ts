export function initSmoothScroll(): () => void {
  const handleSmoothScroll = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const id = target.getAttribute('href')?.slice(1);
      if (id) {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  document.addEventListener('click', handleSmoothScroll);
  
  return () => {
    document.removeEventListener('click', handleSmoothScroll);
  };
}