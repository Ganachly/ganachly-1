import storyHtml from './templates/story.html?raw';

export function renderStoryPage() {
  return storyHtml;
}

export function attachStoryPageEvents() {
  const container = document.querySelector('main');
  if (!container) return;

  container.querySelectorAll('a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === 'menu') link.href = '#/menu';
    else if (path === 'our-story') link.href = '#/story';
    else if (path === 'gifting-and-bulk') link.href = '#/gifting';
    else if (path === 'cart-and-checkout') link.href = '#/menu';
  });
}
