/// <reference types="svelte" />
/// <reference types="vite/client" />

// GeoJSON import declaration
declare module '*.geojson' {
  const content: any;
  export default content;
}
