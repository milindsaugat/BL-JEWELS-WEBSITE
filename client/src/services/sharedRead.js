// Share concurrent reads; cache only successful responses when explicitly requested.
export const createSharedRead = (now = Date.now) => {
  const pending = new Map();
  const cache = new Map();

  return (key, load, ttl = 0) => {
    const cached = cache.get(key);
    if (cached && cached.expires > now()) return Promise.resolve(cached.data);
    cache.delete(key);
    if (pending.has(key)) return pending.get(key);

    const request = Promise.resolve().then(load).then((data) => {
      if (ttl > 0 && data?.success !== false) {
        cache.set(key, { data, expires: now() + ttl });
      }
      return data;
    }).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  };
};
