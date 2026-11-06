// Share concurrent reads; cache responses when requested with error backoff.
export const createSharedRead = (now = Date.now) => {
  const pending = new Map();
  const cache = new Map();

  return (key, load, ttl = 0) => {
    const cached = cache.get(key);
    if (cached && cached.expires > now()) {
      if (cached.error) return Promise.reject(cached.error);
      return Promise.resolve(cached.data);
    }
    cache.delete(key);
    if (pending.has(key)) return pending.get(key);

    const request = Promise.resolve().then(load).then((data) => {
      if (ttl > 0) {
        // Cache successful data for ttl, or unsuccessful response for cooldown (min 45s)
        const expiryTtl = data?.success !== false ? ttl : Math.max(ttl, 45000);
        cache.set(key, { data, expires: now() + expiryTtl });
      }
      return data;
    }).catch((err) => {
      if (ttl > 0) {
        // Cache network/server error to prevent repeated spamming during cooldown
        cache.set(key, { error: err, expires: now() + Math.max(ttl, 45000) });
      }
      throw err;
    }).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  };
};
