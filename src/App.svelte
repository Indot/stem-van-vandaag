<script lang="ts">
    import { onMount } from "svelte";
    import Map from "./lib/Map.svelte";

    // Import gemeentekaart.geojson
    import gemeentekaartUrl from "/gemeentekaart.geojson?url";

    let geoJSONData: any = null;
    // Fixed values for map appearance
    const fillColor = "#3388ff";
    const fillOpacity = 0.2;

    // Load the GeoJSON file on component mount
    onMount(async () => {
        try {
            await loadGeoJSONFromUrl(gemeentekaartUrl);
            console.log(
                `Loaded gemeentekaart.geojson with ${geoJSONData.features.length} features`,
            );
        } catch (error) {
            console.error("Error loading GeoJSON:", error);
        }
    });

    // Load GeoJSON from URL
    async function loadGeoJSONFromUrl(url: string) {
        console.log("Loading GeoJSON...");

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        validateAndLoadGeoJSON(data);
    }

    // Validate and load GeoJSON data
    function validateAndLoadGeoJSON(data: any) {
        if (!data.type || !data.features) {
            console.error("Invalid GeoJSON format");
            return;
        }

        try {
            geoJSONData = data;
            console.log(
                `Processing ${data.features.length} features successfully`,
            );
        } catch (error) {
            console.error(
                `Error processing GeoJSON: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
</script>

<div class="app-container">
    <Map {geoJSONData} {fillColor} {fillOpacity} />
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
