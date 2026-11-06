export const recentKey = userId => `bl_recent_products:${userId || 'guest'}`;
export function readRecent(storage, userId) {
  try {
    const saved = JSON.parse(storage.getItem(recentKey(userId)) || '[]');
    return Array.isArray(saved) ? [...new Set(saved.filter(id => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id)))].slice(0, 24) : [];
  } catch { return []; }
}
export function rememberProduct(storage, userId, id) {
  const ids = [id, ...readRecent(storage, userId).filter(value => value !== id)].slice(0, 24);
  try { storage.setItem(recentKey(userId), JSON.stringify(ids)); } catch { /* Private browsing or full storage must not block shopping. */ }
  return ids;
}
