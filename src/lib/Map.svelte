<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import * as L from "leaflet";
    import "leaflet/dist/leaflet.css";

    export let geoJSONData: any;
    // Fixed gray color for all municipalities
    export let fillColor: string = "#ececec";
    export let fillOpacity: number = 0.6;
    // Array of enabled area codes
    export let enabledAreas: string[] = [];
    // Color for enabled areas - can be a string (all areas same color) or object mapping area codes to colors
    export let enabledColor: string | Record<string, string> = "#3388ff";
    // Default color for enabled areas if not specified in the map
    export let defaultEnabledColor: string = "#3388ff";
    // URL prefix for area links
    export let areaUrlPrefix: string = "";
    // Min and max zoom levels
    export let minZoom: number = 6;
    export let maxZoom: number = 9;
    // Max bounds - will default to slightly larger than the Netherlands
    export let maxBoundsPadding: number = 0.5; // padding beyond the GeoJSON bounds

    let mapElement: HTMLElement;
    let map: L.Map;
    let geoJSONLayer: L.GeoJSON;

    onMount(() => {
        // Initialize map with limited zoom and dragging enabled
        map = L.map(mapElement, {
            dragging: true, // Enable dragging
            touchZoom: true, // Enable pinch-zoom on mobile
            scrollWheelZoom: true, // Enable mouse wheel zoom
            doubleClickZoom: true, // Enable double-click zoom
            boxZoom: true, // Enable box zoom too
            keyboard: true, // Enable keyboard navigation
            zoomControl: false, // We'll add custom zoom control
            attributionControl: false,
            minZoom: minZoom, // Set minimum zoom level
            maxZoom: maxZoom, // Set maximum zoom level
            layers: [],
            markerZoomAnimation: true, // Enable marker zoom animation
            renderer: new L.SVG({ padding: 5 }), // Use SVG renderer with padding
        }).setView([0, 0], minZoom + 1);

        // Add zoom control in the bottom right corner
        L.control
            .zoom({
                position: "bottomright",
            })
            .addTo(map);

        // Force the zoom level to stay within bounds when bounds change
        map.on("zoomend", function () {
            map.fitBounds(map.getBounds());

            if (map.getZoom() < minZoom) {
                map.setZoom(minZoom);
            } else if (map.getZoom() > maxZoom) {
                map.setZoom(maxZoom);
            }
        });

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

    $: if (map && geoJSONData) {
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
                features: geoJSONData.features
                    .map((feature: any) => {
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
                    })
                    .sort((a, b) => {
                        const aEnabled =
                            a.properties.statcode &&
                            enabledAreas.includes(a.properties.statcode);
                        const bEnabled =
                            b.properties.statcode &&
                            enabledAreas.includes(b.properties.statcode);
                        return aEnabled === bEnabled ? 0 : aEnabled ? 1 : -1;
                    }),
            };

            // Add the new layer to the map with fixed gray style
            geoJSONLayer = L.geoJSON(bufferedGeoJSON, {
                interactive: true, // Keep interactive for hover but disable click
                style: function (feature) {
                    const statcode = feature?.properties?.statcode;
                    const isEnabled =
                        statcode && enabledAreas.includes(statcode);

                    // Determine the fill color for enabled areas
                    let areaFillColor = fillColor; // Default gray

                    if (isEnabled) {
                        if (typeof enabledColor === "string") {
                            // Use the single color for all enabled areas
                            areaFillColor = enabledColor;
                        } else if (
                            typeof enabledColor === "object" &&
                            statcode &&
                            enabledColor[statcode]
                        ) {
                            // Use specific color for this area if defined
                            areaFillColor = enabledColor[statcode];
                        } else {
                            // Fallback to default enabled color
                            areaFillColor = defaultEnabledColor;
                        }
                    }

                    return {
                        color: isEnabled ? "#303030" : "#bbb",
                        weight: isEnabled ? 2 : 1,
                        opacity: 1,
                        fillColor: areaFillColor,
                        fillOpacity: isEnabled ? 0.7 : fillOpacity,
                        className: isEnabled ? "enabled-area" : "",
                    };
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        const isEnabled =
                            feature.properties.statcode &&
                            enabledAreas.includes(feature.properties.statcode);

                        // Add tooltip for all areas
                        if (feature.properties.statnaam) {
                            // Use mousemove to dynamically create and position a div tooltip
                            let customTooltip: HTMLDivElement | null = null;

                            // On mouse over the area
                            layer.on("mouseover", function () {
                                // Create tooltip element if it doesn't exist
                                if (!customTooltip) {
                                    customTooltip =
                                        document.createElement("div");
                                    customTooltip.className = isEnabled
                                        ? "custom-tooltip-enabled"
                                        : "custom-tooltip";
                                    customTooltip.textContent =
                                        feature.properties.statnaam;
                                    document.body.appendChild(customTooltip);
                                }
                            });

                            // Update tooltip position on mouse move
                            layer.on("mousemove", function (e) {
                                if (customTooltip) {
                                    // Position the tooltip near the cursor
                                    const x = e.originalEvent.pageX;
                                    const y = e.originalEvent.pageY - 30; // 30px above the cursor
                                    customTooltip.style.left = x + "px";
                                    customTooltip.style.top = y + "px";
                                    customTooltip.style.display = "block";
                                }
                            });

                            // Remove tooltip on mouse out
                            layer.on("mouseout", function () {
                                if (customTooltip) {
                                    document.body.removeChild(customTooltip);
                                    customTooltip = null;
                                }
                            });
                        }

                        if (isEnabled) {
                            // Add hover styling for enabled areas
                            layer.on("mouseover", function () {
                                layer.setStyle({
                                    weight: 3,
                                    color: "#000",
                                    dashArray: "",
                                    fillOpacity: 0.8,
                                });
                                layer.bringToFront();
                            });

                            layer.on("mouseout", function () {
                                geoJSONLayer.resetStyle(layer);
                            });

                            // Add click handler for enabled areas
                            layer.on("click", function () {
                                if (
                                    areaUrlPrefix &&
                                    feature.properties.statcode
                                ) {
                                    window.location.href = `${areaUrlPrefix}${feature.properties.statcode}`;
                                }
                            });
                        } else {
                            // Disable click events for non-enabled areas
                            layer.off("click");
                            layer.on("click", function (e) {
                                // Prevent the default click behavior
                                L.DomEvent.stopPropagation(e);
                                return false;
                            });
                        }
                    }
                },
            }).addTo(map);

            // Zoom to the layer bounds
            if (geoJSONLayer.getBounds().isValid()) {
                const bounds = geoJSONLayer.getBounds();

                // Set max bounds to prevent dragging too far away from the Netherlands
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();
                const latDiff = (ne.lat - sw.lat) * maxBoundsPadding;
                const lngDiff = (ne.lng - sw.lng) * maxBoundsPadding;
                const maxBounds = L.latLngBounds(
                    L.latLng(sw.lat - latDiff, sw.lng - lngDiff),
                    L.latLng(ne.lat + latDiff, ne.lng + lngDiff),
                );

                map.setMaxBounds(maxBounds);
                map.fitBounds(bounds);
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
        background-color: white;
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
        border: 2px solid white;
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
        border: 2px solid rgba(0, 0, 0, 0.2);
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
</style>
