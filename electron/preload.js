const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
});

contextBridge.exposeInMainWorld("electronAuth", {
    isAuthReachable: async(authUrl) => ipcRenderer.invoke("auth:ping", authUrl)
})

contextBridge.exposeInMainWorld("electronZoom", {
  getZoomLevel: () => webFrame.getZoomLevel(),
  setZoomLevel: (level) => webFrame.setZoomLevel(level),
  zoomIn: () => webFrame.setZoomLevel(webFrame.getZoomLevel() + 1),
  zoomOut: () => webFrame.setZoomLevel(webFrame.getZoomLevel() - 1),
  resetZoom: () => webFrame.setZoomLevel(0),
})
