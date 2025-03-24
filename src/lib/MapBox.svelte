<script lang="ts">
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";

    let {
        geoJSONData,
        fillColor = "#ececec",
        fillOpacity = 0.6,
        lineColor = "#bbb",
        areaProperties = {},
        defaultEnabledColor = "#3388ff",
    } = $props();

    let mapElement: HTMLElement;

    $effect(() => {
        if (!mapElement) return;

        if (!geoJSONData) return;

        const map = new maplibregl.Map({
            container: mapElement,
            style: { version: 8, sources: {}, layers: [] },
            zoom: 7,
            attributionControl: false,
        });
        let hoveredPolygonId: string | null = null;

        map.on("load", () => {
            const gemeentenId = "gemeenten";

            map.addSource(gemeentenId, {
                type: "geojson",
                data: geoJSONData,
                generateId: true,
            });

            map.addLayer({
                id: "state-fills",
                type: "fill",
                source: gemeentenId,
                layout: {},
                paint: {
                    // @ts-expect-error
                    "fill-color": [
                        "match",
                        ["get", "statcode"],
                        ...Object.entries(areaProperties).flatMap(
                            ([key, value]) =>
                                [
                                    key,
                                    (value.color as string) ??
                                        defaultEnabledColor,
                                ] as const,
                        ),
                        fillColor,
                    ],
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        1,
                        fillOpacity,
                    ],
                },
            });

            map.addLayer({
                id: "state-borders",
                type: "line",
                source: gemeentenId,
                layout: {
                    "line-sort-key": [
                        "case",
                        [
                            "boolean",
                            [
                                "in",
                                ["get", "statcode"],
                                ["literal", Object.keys(areaProperties)],
                            ],
                            true,
                        ],
                        1,
                        0,
                    ],
                },
                paint: {
                    // @ts-expect-error
                    "line-color": [
                        "match",
                        ["get", "statcode"],
                        ...Object.entries(areaProperties).flatMap(
                            ([key, value]) =>
                                [
                                    key,
                                    (value.color as string) ??
                                        defaultEnabledColor,
                                ] as const,
                        ),
                        lineColor,
                    ],
                    "line-width": 0.5,
                },
            });

            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
            });

            map.on("mousemove", "state-fills", (e) => {
                const statcode = e.features?.[0].properties?.statcode;
                if (areaProperties[statcode]?.link) {
                    map.getCanvas().style.cursor = "pointer";
                } else {
                    map.getCanvas().style.cursor = "";
                }

                if (hoveredPolygonId !== null) {
                    map.setFeatureState(
                        { source: gemeentenId, id: hoveredPolygonId },
                        { hover: false },
                    );
                }

                if ((e.features?.length ?? 0) > 0) {
                    hoveredPolygonId = String(e.features?.[0].id) ?? null;
                    map.setFeatureState(
                        { source: gemeentenId, id: hoveredPolygonId },
                        { hover: true },
                    );
                }

                popup
                    .setLngLat(e.lngLat)
                    .setText(e.features?.[0].properties?.statnaam ?? "")
                    .addTo(map);
            });

            map.on("mouseleave", "state-fills", () => {
                map.getCanvas().style.cursor = "";

                if (hoveredPolygonId !== null) {
                    map.setFeatureState(
                        { source: gemeentenId, id: hoveredPolygonId },
                        { hover: false },
                    );
                }
                hoveredPolygonId = null;
                popup.remove();
            });

            // Add click handler for enabled areas
            map.on("click", "state-fills", (e) => {
                const statcode = e.features?.[0].properties?.statcode;

                if (areaProperties[statcode]?.link) {
                    window
                        .open(areaProperties[statcode]?.link, "_blank")
                        ?.focus();
                }
            });

            const bounds = new maplibregl.LngLatBounds();
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

    :global(.maplibregl-canvas-container.maplibregl-interactive) {
        cursor: default;
    }

    :global(.maplibregl-canvas-container.maplibregl-interactive:active) {
        cursor: move;
    }
</style>
