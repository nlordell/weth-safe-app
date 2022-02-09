let onSafeInfo;
const safeInfo = new Promise((resolve) => {
  onSafeInfo = resolve;
});

let currentId = 0;
const pendingRequests = new Map();

window.addEventListener("message", (message) => {
  if (message.source !== window.parent) {
    return;
  }

  const { id } = message.data;
  if (id !== undefined) {
    const callback = pendingRequests.get(id);
    if (!pendingRequests.delete(id)) {
      console.warn("unexpected response", message.data);
      throw new Error(`unexpected response ${id}`);
    }

    callback(message.data);
    return;
  }

  const { messageId, data } = message.data;
  switch (messageId) {
    case "ON_SAFE_INFO":
      onSafeInfo(data);
      break;
    default:
      console.warn("unexpected message", message.data);
      break;
  }
});

export function getSafeInfo() {
  return safeInfo;
}

function send(method, params) {
  const request = {
    id: currentId++,
    method,
    params,
    env: {
      sdkVersion: "5.0.0",
    },
  };
  return new Promise((resolve, reject) => {
    pendingRequests.set(request.id, (response) => {
      if (!response.success) {
        reject(new Error(response.error));
        return;
      }
      resolve(response.data);
    });
    this.parent.postMessage(request, "*");
  });
}

export function rpcCall(method, params) {
  return send("rpcCall", { call: method, params });
}

export function sendTransactions(txs, params = {}) {
  return send("sendTransactions", { txs, params });
}
