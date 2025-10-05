/*
  This is a simple example of how to use a Shared Worker to share a WebSocket connection
  between multiple tabs. Each tab can send messages to the Shared Worker, which will forward
  them to the WebSocket server. Messages received from the WebSocket server are broadcasted
  to all connected tabs.
*/
const worker = new SharedWorker('shared-worker.js');
worker.port.start();

worker.port.onmessage = (event) => {
  console.log('Message from Shared Worker:', event.data);
};

worker.port.postMessage('Hello from this tab!');

let socket;
const ports = [];

onconnect = (e) => {
  const port = e.port[0];
  ports.push(port);

  if (!socket) {
    socket = new WebSocket('wss://example.com');
    socket.onmessage = (msg) => {
      ports.forEach((p) => p.postMessage(msg.data));
    };
  }

  port.onmessage = (msg) => socket.send(msg.data);
  port.start();
};
