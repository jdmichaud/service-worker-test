function ThreadRequester(sender, receiver=undefined) {
  if (receiver === undefined) {
    receiver = sender;
  }

  let counter = 0;
  let inflight = {};

  receiver.addEventListener('message', event => {
    const message = event.data;
    if (message.__id === undefined) {
      console.warn('received a message with no id');
    }
    inflight[message.__id].resolve(message);
    delete inflight[message.__id];
  });

  receiver.addEventListener('messageerror', event => {
    const message = event.data;
    if (message.__id === undefined) {
      console.warn('received a message error with no id');
    }
    inflight[message.__id].reject(message);
    delete inflight[message.__id];
  });

  return {
    send: (message, transfer) => {
      counter += 1;
      const promiseWithResolvers = Promise.withResolvers();
      inflight[counter] = promiseWithResolvers;
      if (message === undefined || message === null) {
        message = {};
      }
      message.__id = counter;
      sender.postMessage(message, transfer);
      return inflight[counter].promise;
    },
  };
}

async function main() {
  console.log('ready');

  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker is not supported in this browser.');
    return;
  }
  const serviceWorkerContainer = navigator.serviceWorker;

  const { promise: serviceWorkerPromise, resolve: resolveServiceWorker } = Promise.withResolvers();
  serviceWorkerContainer.ready.then(registration => {
    console.log('serviceWorkerContainer.ready');
    resolveServiceWorker(registration.active);
  });

  const { promise: registrationPromise, resolve: resolveRegistration } = Promise.withResolvers();
  // Register the Service Worker when the page loads
  serviceWorkerContainer.register('/service-worker.js')
    .then(async (registration) => {
      console.log('Service Worker registered with registration: ', registration);
      await registration.update();
      resolveRegistration(registration);
    })
    .catch((error) => {
      console.log('Service Worker registration failed: ', error);
    });

  const [serviceWorker, _] = await Promise.all([serviceWorkerPromise, registrationPromise]);
  const requester = new ThreadRequester(serviceWorker, serviceWorkerContainer);

  {
    console.log('posting big ArrayBuffer...');
    const data = new ArrayBuffer(1024 * 1024 * 1024 * 1);
    const start = Date.now();
    await requester.send({ start, data }, [data]);
  }
  if (window.SharedArrayBuffer) {
    console.log('posting big SharedArrayBuffer...');
    const data = new SharedArrayBuffer(1024 * 1024 * 1024 * 1);
    const start = Date.now();
    console.log('before post');
    await requester.send({ start, data });
    console.log('after post');
  }
}

window.onload = main;