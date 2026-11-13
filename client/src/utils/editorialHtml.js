const UNSAFE_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'style',
  'link',
  'meta',
  'form',
  'input',
  'textarea',
  'button',
]);

const slugifyHeading = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

/**
 * Safely sanitizes editorial HTML via DOMParser, assigns anchor IDs to H2/H3
 * for Table of Contents navigation, and wraps comparison tables in accessible
 * horizontal-scroll containers.
 */
export const processEditorialHtml = (rawHtml = '') => {
  if (!rawHtml || typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return { sanitizedHtml: '', tocItems: [] };
  }

  const doc = new DOMParser().parseFromString(String(rawHtml), 'text/html');
  const tocItems = [];
  const usedIds = new Set();

  // Remove dangerous elements
  for (const tag of UNSAFE_TAGS) {
    doc.body.querySelectorAll(tag).forEach((el) => el.remove());
  }

  // Strip event handlers & javascript: URLs from all elements
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const val = String(attr.value || '').trim().toLowerCase();
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
      } else if ((name === 'href' || name === 'src') && val.startsWith('javascript:')) {
        el.setAttribute(attr.name, '#');
      }
    }
  });

  // Extract H2 / H3 headings and inject unique anchor IDs
  doc.body.querySelectorAll('h2, h3').forEach((heading, idx) => {
    const text = heading.textContent?.trim();
    if (!text) return;
    let id = heading.getAttribute('id') || slugifyHeading(text);
    if (usedIds.has(id)) id = `${id}-${idx}`;
    usedIds.add(id);
    heading.setAttribute('id', id);
    tocItems.push({
      id,
      text,
      level: heading.tagName === 'H3' ? 3 : 2,
    });
  });

  // Ensure inline images have lazy loading and alt attributes
  doc.body.querySelectorAll('img').forEach((img) => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('alt')) img.setAttribute('alt', 'BL Jewels editorial illustration');
  });

  // Wrap tables in accessible responsive scroll containers if not already wrapped
  doc.body.querySelectorAll('table').forEach((table) => {
    if (table.parentElement?.classList.contains('bl-table-wrap')) return;
    const wrapper = doc.createElement('div');
    wrapper.className = 'bl-table-wrap';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('aria-label', 'Editorial comparison table');
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  return {
    sanitizedHtml: doc.body.innerHTML,
    tocItems,
  };
};

