<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import * as L from "leaflet";
    import "leaflet/dist/leaflet.css";

    export let geoJSONData: any;
    export let fillColor: string = "#3388ff";
    export let fillOpacity: number = 0.2;

    let mapElement: HTMLElement;
    let map: L.Map;
    let geoJSONLayer: L.GeoJSON;

    onMount(() => {
        // Initialize map with dragging and other interactive features disabled
        map = L.map(mapElement, {
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomControl: false
        }).setView([0, 0], 2);

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

    $: if (
        map &&
        geoJSONData &&
        (fillColor !== undefined || fillOpacity !== undefined)
    ) {
        updateMap();
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
                            geometry: feature.geometry,
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
                            .map(
                                ([key, value]) =>
                                    `<strong>${key}:</strong> ${value}`,
                            )
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

