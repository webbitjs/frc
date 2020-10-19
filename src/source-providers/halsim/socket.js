

var socketOpen = false;
var socket = null;
const connectionListeners = [];
const messageListeners = [];
let reconnectTimeoutId = null;

export function connect(address) {

  if (socket) {
    console.log("SOCKET:", socket.url);
    if (reconnectTimeoutId !== null) {
      clearTimeout(reconnectTimeoutId);
    }
    socket.close();
  }

  socket = new WebSocket(address);
  if (socket) {
    socket.onopen = function () {
      console.info("Socket opened");
      socketOpen = true;
      connectionListeners.forEach(listener => {
        listener(true);
      });
    };

    socket.onmessage = function (msg) {
      var data = JSON.parse(msg.data);
      messageListeners.forEach(listener => {
        listener(data);
      });
    };

    socket.onclose = function () {
      if (socketOpen) {
        console.info("Socket closed");
        connectionListeners.forEach(listener => {
          listener(false);
        });
      }
      // respawn the websocket
      if (socket === this) {
        reconnectTimeoutId = setTimeout(() => {
          connect(address);
        }, 300);
      }
    };
  }
}

export function sendMsg(o) {
  if (socket) {
    var msg = JSON.stringify(o);
    socket.send(msg);
  }
}

export function isConnected() {
  return socketOpen;
}

export function addConnectionListener(listener, immediatelyNotify) {
  connectionListeners.push(listener);
  if (immediatelyNotify) {
    listener(socketOpen);
  }
}

export function addMessageListener(listener) {
  messageListeners.push(listener);
}

