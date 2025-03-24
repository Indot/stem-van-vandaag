<script lang="ts">
    import mapboxgl from "mapbox-gl";

    import "mapbox-gl/dist/mapbox-gl.css";

    let {
        geoJSONData,
        fillColor = "#ececec",
        fillOpacity = 0.6,
        lineColor = "#bbb",
        enabledAreas = [],
        areaProperties = {},
        defaultEnabledColor = "#3388ff",
    } = $props();

    let mapElement: HTMLElement;

    $effect(() => {
        if (!mapElement) return;

        if (!geoJSONData) return;

        const map = new mapboxgl.Map({
            container: mapElement,
            style: { version: 8, sources: {}, layers: [] },
            zoom: 7,
        });
        let hoveredPolygonId: string | null = null;

        map.on("load", () => {
            map.addSource("gemeenten", {
                type: "geojson",
                data: geoJSONData,
                generateId: true,
            });

            // The feature-state dependent fill-opacity expression will render the hover effect
            // when a feature's hover state is set to true.
            map.addLayer({
                id: "state-fills",
                type: "fill",
                source: "gemeenten",
                layout: {},
                paint: {
                    "fill-color": fillColor,
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        1,
                        0.5,
                    ],
                },
            });

            map.addLayer({
                id: "state-borders",
                type: "line",
                source: "gemeenten",
                layout: {},
                paint: {
                    "line-color": lineColor,
                    "line-width": 0.5,
                },
            });

            // When the user moves their mouse over the state-fill layer, we'll update the
            // feature state for the feature under the mouse.
            map.on("mousemove", "state-fills", (e) => {
                if ((e.features?.length ?? 0) > 0) {
                    if (hoveredPolygonId !== null) {
                        map.setFeatureState(
                            { source: "gemeenten", id: hoveredPolygonId },
                            { hover: false },
                        );
                    }

                    hoveredPolygonId = String(e.features?.[0].id) ?? null;
                    map.setFeatureState(
                        { source: "gemeenten", id: hoveredPolygonId },
                        { hover: true },
                    );
                }
            });

            const bounds = new mapboxgl.LngLatBounds();
            for (const feature of geoJSONData.features) {
                for (const coordinates of feature.geometry.coordinates) {
                    for (const coordinate of coordinates) {
                        try {
                            bounds.extend(coordinate);
                        } catch {}
                    }
                }
            }
            map.fitBounds(bounds, {
                animate: false,
                padding: {
                    top: 180,
                    bottom: 50,
                    right: 20,
                    left: 20,
                },
            });
        });
    });
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
    .map-container {
        width: 100%;
        height: 100%;
        background-color: transparent;
        flex-grow: 1;
    }

    :global(.leaflet-container) {
        height: 100%;
        width: 100%;
    }

    /* Styles now moved to custom tooltips */

    /* Custom tooltip styles */
    :global(.custom-tooltip) {
        position: absolute;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 6px 10px;
        border-radius: 3px;
        font-weight: bold;
        pointer-events: none;
        text-align: center;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(.custom-tooltip-enabled) {
        position: absolute;
        z-index: 9999;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 10px;
        border-radius: 3px;
        font-weight: bold;
        pointer-events: none;
        text-align: center;
        border: 1px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(.enabled-area) {
        cursor: pointer;
    }

    :global(.leaflet-control-zoom) {
        margin: 10px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    :global(.leaflet-control-zoom-in),
    :global(.leaflet-control-zoom-out) {
        width: 30px !important;
        height: 30px !important;
        line-height: 30px !important;
        font-size: 18px !important;
        color: #555;
        background-color: #fff;
    }

    :global(.leaflet-control-zoom-in:hover),
    :global(.leaflet-control-zoom-out:hover) {
        background-color: #f4f4f4;
        color: #000;
    }

    :global(.mapboxgl-ctrl-logo) {
        display: none !important;
    }
</style>
