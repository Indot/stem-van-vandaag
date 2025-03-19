<script lang="ts">
  import { onMount } from 'svelte';
  import Map from './lib/Map.svelte';
  import ControlPanel from './lib/ControlPanel.svelte';
  
  // Import gemeentekaart.geojson
  import gemeentekaartUrl from '../public/gemeentekaart.geojson?url';
  
  let geoJSONData: any = null;
  let spacing = 0.0001;
  let fillColor = '#3388ff';
  let fillOpacity = 0.2;
  let status = '';
  let isError = false;
  let isFileLoaded = false;
  let filename = 'Drop GeoJSON file here or click to select';
  
  // Load the GeoJSON file on component mount
  onMount(async () => {
    try {
      await loadGeoJSONFromUrl(gemeentekaartUrl);
      filename = 'gemeentekaart.geojson loaded';
      isFileLoaded = true;
      updateStatus(`Loaded ${geoJSONData.features.length} features successfully`);
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
      updateStatus(`Error loading GeoJSON: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  });

  // Status update function
  function updateStatus(message: string, error = false) {
    status = message;
    isError = error;
  }
  
  // Load GeoJSON from URL
  async function loadGeoJSONFromUrl(url: string) {
    updateStatus('Loading GeoJSON...');
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    validateAndLoadGeoJSON(data);
  }
  
  // Handle file selection events from ControlPanel
  function handleFileSelected(event: CustomEvent<{file: File}>) {
    const file = event.detail.file;
    updateStatus('Reading file...');
    filename = file.name;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          validateAndLoadGeoJSON(data);
        }
      } catch (error) {
        isFileLoaded = false;
        updateStatus(`Error parsing GeoJSON file: ${error instanceof Error ? error.message : String(error)}`, true);
      }
    };
    
    reader.onerror = () => {
      isFileLoaded = false;
      updateStatus('Error reading file', true);
    };
    
    reader.readAsText(file);
  }
  
  // Load sample data
  function handleLoadSample() {
    updateStatus('Loading sample data...');
    
    // Simple sample GeoJSON with a few polygons
    const sampleGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Area 1",
            description: "Sample area 1",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.1, 51.5],
                [0, 51.6],
                [0.1, 51.5],
                [0, 51.4],
                [-0.1, 51.5],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Area 2",
            description: "Sample area 2",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0.1, 51.5],
                [0.2, 51.6],
                [0.3, 51.5],
                [0.2, 51.4],
                [0.1, 51.5],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Area 3",
            description: "Sample area 3",
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-0.1, 51.3],
                [0, 51.4],
                [0.1, 51.3],
                [0, 51.2],
                [-0.1, 51.3],
              ],
            ],
          },
        },
      ],
    };
    
    validateAndLoadGeoJSON(sampleGeoJSON);
    filename = 'Sample GeoJSON loaded';
  }
  
  // Validate and load GeoJSON data
  function validateAndLoadGeoJSON(data: any) {
    if (!data.type || !data.features) {
      updateStatus('Invalid GeoJSON format', true);
      isFileLoaded = false;
      return;
    }
    
    try {
      geoJSONData = data;
      isFileLoaded = true;
      updateStatus(`Loaded ${data.features.length} features successfully`);
    } catch (error) {
      isFileLoaded = false;
      updateStatus(`Error processing GeoJSON: ${error instanceof Error ? error.message : String(error)}`, true);
    }
  }
</script>

<div class="app-container">
  <Map 
    {geoJSONData} 
    {spacing} 
    {fillColor} 
    {fillOpacity} 
  />
  
  <ControlPanel 
    {spacing} 
    {fillColor} 
    {fillOpacity} 
    {status} 
    {isError} 
    {isFileLoaded} 
    {filename}
    on:fileSelected={handleFileSelected}
    on:loadSample={handleLoadSample}
  />
</div>

<style>
  .app-container {
    position: relative;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    overflow: hidden;
  }
</style>
