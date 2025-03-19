<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let spacing: number = 0.0001;
  export let fillColor: string = '#3388ff';
  export let fillOpacity: number = 0.2;
  export let status: string = '';
  export let isError: boolean = false;
  export let isFileLoaded: boolean = false;
  export let filename: string = 'Drop GeoJSON file here or click to select';

  const dispatch = createEventDispatcher();

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      dispatch('fileSelected', { file });
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    fileDragActive = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    fileDragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    fileDragActive = false;
    
    if (event.dataTransfer?.files.length) {
      dispatch('fileSelected', { file: event.dataTransfer.files[0] });
    }
  }

  function loadSample() {
    dispatch('loadSample');
  }

  let fileDragActive = false;
</script>

<div class="control-panel">
  <div 
    class="file-drop" 
    class:active={fileDragActive} 
    class:success={isFileLoaded}
    on:click={() => document.getElementById('file-input')?.click()}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    {filename}
    <input
      type="file"
      id="file-input"
      style="display: none"
      accept=".geojson,.json"
      on:change={handleFileChange}
    />
  </div>

  <button id="load-sample" on:click={loadSample}>Load Sample GeoJSON Data</button>

  <div id="status" class:error-message={isError} class:success-message={!isError && status}>
    {status}
  </div>

  <label for="spacing-slider">
    Area Spacing: <span>{spacing}</span>
  </label>
  <input
    type="range"
    id="spacing-slider"
    min="0"
    max="0.001"
    step="0.0001"
    bind:value={spacing}
  />

  <label for="color-selector">Area Color:</label>
  <input type="color" id="color-selector" bind:value={fillColor} />

  <label for="opacity-slider">
    Fill Opacity: <span>{fillOpacity}</span>
  </label>
  <input
    type="range"
    id="opacity-slider"
    min="0"
    max="1"
    step="0.1"
    bind:value={fillOpacity}
  />
</div>

<style>
  .control-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    max-width: 300px;
  }

  .file-drop {
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .file-drop.active {
    border-color: #2196f3;
  }

  .file-drop.success {
    border-color: #4caf50;
    background-color: rgba(76, 175, 80, 0.1);
  }

  input[type="range"] {
    width: 100%;
  }

  label {
    display: block;
    margin-top: 10px;
  }

  #status {
    margin-top: 10px;
    padding: 5px;
    text-align: center;
    font-size: 14px;
  }

  .success-message {
    color: #4caf50;
  }

  .error-message {
    color: #f44336;
  }

  #load-sample {
    display: block;
    margin-top: 10px;
    padding: 8px;
    width: 100%;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  #load-sample:hover {
    background-color: #45a049;
  }
</style>