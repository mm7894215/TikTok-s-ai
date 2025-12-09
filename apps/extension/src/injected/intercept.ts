(() => {
  const dispatchPayload = (payload: { url: string; body: ArrayBuffer | any; headers: Record<string, string> }) => {
    window.dispatchEvent(new CustomEvent('TT_Data_Intercept', { detail: payload }));
  };

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    try {
      const clone = response.clone();
      const buffer = await clone.arrayBuffer();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const headers = Object.fromEntries(clone.headers.entries());

      dispatchPayload({ url, body: buffer, headers });
    } catch (err) {
      console.warn('intercept failed', err);
    }

    return response;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (...args) {
    (this as any)._ttIntelUrl = args[1];
    return originalOpen.apply(this, args as any);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('loadend', () => {
      try {
        const url = (this as any)._ttIntelUrl as string;
        const headers: Record<string, string> = {};
        const rawHeaders = this.getAllResponseHeaders()?.trim();
        if (rawHeaders) {
          rawHeaders.split(/\r?\n/).forEach((line) => {
            const [key, ...rest] = line.split(':');
            if (!key) return;
            headers[key.toLowerCase()] = rest.join(':').trim();
          });
        }

        let body: ArrayBuffer | any = this.response;
        if (typeof body === 'string') {
          body = new TextEncoder().encode(body).buffer;
        }

        dispatchPayload({ url, body, headers });
      } catch (err) {
        console.warn('xhr intercept failed', err);
      }
    });

    return originalSend.apply(this, args as any);
  };
})();
