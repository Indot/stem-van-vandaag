<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  export let geoJSONData: any;
  export let spacing: number = 0.0001;
  export let fillColor: string = '#3388ff';
  export let fillOpacity: number = 0.2;

  let mapElement: HTMLElement;
  let map: L.Map;
  let geoJSONLayer: L.GeoJSON;

  onMount(() => {
    // Initialize map
    map = L.map(mapElement).setView([0, 0], 2);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Load GeoJSON if available
    if (geoJSONData) {
      updateMap();
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  $: if (map && geoJSONData && (spacing !== undefined || fillColor !== undefined || fillOpacity !== undefined)) {
    updateMap();
  }

  function bufferGeometry(geometry: any, buffer: number) {
    // Handle different geometry types
    if (geometry.type === "Polygon") {
      return bufferPolygon(geometry, buffer);
    } else if (geometry.type === "MultiPolygon") {
      return {
        type: "MultiPolygon",
        coordinates: geometry.coordinates.map(
          (poly: any) =>
            bufferPolygon({ type: "Polygon", coordinates: poly }, buffer)
              .coordinates,
        ),
      };
    } else {
      // Return original geometry for unsupported types
      return geometry;
    }
  }

  function bufferPolygon(polygon: any, buffer: number) {
    // Create a negative buffer (shrink) for each polygon
    const coordinates = polygon.coordinates.map((ring: any) => {
      // Only buffer the outer ring (first ring)
      if (ring === polygon.coordinates[0]) {
        return ring.map((coord: any, i: number, arr: any[]) => {
          const next = arr[(i + 1) % arr.length];
          const prev = arr[(i - 1 + arr.length) % arr.length];

          // Calculate vectors
          const v1 = [coord[0] - prev[0], coord[1] - prev[1]];
          const v2 = [next[0] - coord[0], next[1] - coord[1]];

          // Normalize vectors
          const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
          const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

          if (len1 === 0 || len2 === 0) {
            return coord; // Handle degenerate case
          }

          const n1 = [v1[0] / len1, v1[1] / len1];
          const n2 = [v2[0] / len2, v2[1] / len2];

          // Calculate bisector (perpendicular to the average of the two normals)
          const avg = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2];
          const len = Math.sqrt(avg[0] * avg[0] + avg[1] * avg[1]);

          // If the point is more complex, use simpler buffering
          if (len < 0.1) {
            return [
              coord[0] - buffer * (n1[1] - n2[1]),
              coord[1] - buffer * (n2[0] - n1[0]),
            ];
          }

          const bisector = [avg[0] / len, avg[1] / len];

          // Calculate cross product to determine direction
          const cross = n1[0] * n2[1] - n1[1] * n2[0];
          const scale =
            buffer /
            Math.max(0.001, Math.abs(n1[0] * n2[1] - n1[1] * n2[0]));

          // Move point inward along bisector
          return [
            coord[0] - bisector[1] * scale * Math.sign(cross),
            coord[1] + bisector[0] * scale * Math.sign(cross),
          ];
        });
      }
      return ring; // Return inner rings as they are
    });

    return {
      type: "Polygon",
      coordinates: coordinates,
    };
  }

  function updateMap() {
    if (!map || !geoJSONData) return;

    // Remove existing layer if present
    if (geoJSONLayer) {
      map.removeLayer(geoJSONLayer);
    }

    try {
      // Create a new GeoJSON with buffered geometries
      const bufferedGeoJSON = {
        type: geoJSONData.type,
        features: geoJSONData.features.map((feature: any) => {
          try {
            return {
              type: feature.type,
              properties: feature.properties || {},
              geometry: bufferGeometry(feature.geometry, spacing),
            };
          } catch (e) {
            console.warn("Error buffering feature:", e);
            return feature; // Return original feature if buffering fails
          }
        }),
      };

      // Add the new layer to the map
      geoJSONLayer = L.geoJSON(bufferedGeoJSON, {
        style: {
          color: fillColor,
          weight: 1,
          opacity: 1,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const popupContent = Object.entries(feature.properties)
              .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
              .join("<br>");
            if (popupContent) {
              layer.bindPopup(popupContent);
            }
          }
        },
      }).addTo(map);

      // Zoom to the layer bounds
      if (geoJSONLayer.getBounds().isValid()) {
        map.fitBounds(geoJSONLayer.getBounds());
      }
    } catch (error) {
      console.error("Error rendering map:", error);
    }
  }
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }

  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
  }
</style>