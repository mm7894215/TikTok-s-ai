(() => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    try {
      const clone = response.clone();
      const buffer = await clone.arrayBuffer();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;

      window.dispatchEvent(
        new CustomEvent('TT_Data_Intercept', {
          detail: { url, body: buffer }
        })
      );
    } catch (err) {
      console.warn('intercept failed', err);
    }

    return response;
  };
})();
