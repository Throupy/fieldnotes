export {}

declare global {
  interface Window {
    electronZoom: {
      getZoomLevel: () => number;
      setZoomLevel: (level: number) => void;
      zoomIn: () => void;
      zoomOut: () => void;
      resetZoom: () => void;
    };
  }
}
