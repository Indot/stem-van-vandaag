<script lang="ts">
    import { onMount } from "svelte";
    import Map from "./lib/Map.svelte";

    // Import gemeentekaart.geojson
    import gemeentekaartUrl from "/gemeentekaart.geojson?url";

    let geoJSONData: any = null;

    // Example of enabled areas - replace with your actual enabled area codes
    const enabledAreas = [
        "GM1966", // Hogeland
        "GM0080", // Leeuwarden
        "GM1952", // Midden-Groningen
        "GM1970", // Noardeast
        "GM0173", // Oldenzaal
        "GM0086", // Opsterland
        "GM1949", // Waadhoeke
    ];
    const areaUrlPrefix = "/gebied/";

    // Define specific colors for each enabled area
    const areaColors = {
        GM1966: "#1bb7ba", // Hogeland
        GM0080: "#007DC3", // Leeuwarden
        GM1952: "#00C2A8", // Midden-Groningen
        GM1970: "#009fe3", // Noardeast
        GM0173: "#1d0d69", // Oldenzaal
        GM0086: "#063", // Opsterland
        GM1949: "#4BA69E", // Waadhoeke
    };

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
    <Map
        {geoJSONData}
        {enabledAreas}
        {areaUrlPrefix}
        enabledColor={areaColors}
        defaultEnabledColor="#4CAF50"
        minZoom={8}
        maxZoom={14}
        maxBoundsPadding={0.3}
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
