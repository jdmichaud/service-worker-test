async function main() {
  console.log('ready');

  window.SharedArrayBuffer
    ? console.log('SharedArrayBuffer available')
    : console.log('SharedArrayBuffer not available');

  const { promise: serviceWorkerPromise, resolve } = Promise.withResolvers();
  navigator.serviceWorker.ready.then(registration => {
    console.log('navigator.serviceWorker.ready');
    resolve(registration.active);
  });

  if ('serviceWorker' in navigator) {
    // Register the Service Worker when the page loads
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with registration: ', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed: ', error);
      });
  } else {
    console.log('Service Worker is not supported in this browser.');
  }

  const serviceWorker = await serviceWorkerPromise;
  {
    console.log('posting big ArrayBuffer...');
    const data = new ArrayBuffer(1024 * 1024 * 1024 * 1);
    const start = Date.now();
    await serviceWorker.postMessage({ start, data });
  }
  if (window.SharedArrayBuffer) {
    console.log('posting big SharedArrayBuffer...');
    const data = new SharedArrayBuffer(1024 * 1024 * 1024 * 1);
    const start = Date.now();
    await serviceWorker.postMessage({ start, data });
  }
}

window.onload = main;