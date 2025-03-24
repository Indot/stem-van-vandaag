<script lang="ts">
    import { onMount } from "svelte";
    import MapBox from "./lib/MapBox.svelte";

    // Import gemeentekaart.geojson
    import gemeentekaartUrl from "/gemeentekaart.geojson?url";

    let geoJSONData: any = null;

    // Define specific colors for each enabled area
    const areaProperties = {
        GM1966: { color: "#1bb7ba", link: "https://stemvanonshogeland.nl" }, // Hogeland
        GM0080: { color: "#007DC3", link: "https://destemvanleeuwarden.nl" }, // Leeuwarden
        GM1952: {
            color: "#00C2A8",
            link: "https://stemvan.midden-groningen.nl",
        }, // Midden-Groningen
        GM1970: { color: "#009fe3", link: "https://stemvannoardeast.nl" }, // Noardeast
        GM0173: { color: "#1d0d69", link: "https://stemvanoldenzaal.nl" }, // Oldenzaal
        GM0086: { color: "#063", link: "https://stemvan.opsterland.nl" }, // Opsterland
        GM1949: { color: "#4BA69E", link: "https://stemvanwaadhoeke.nl" }, // Waadhoeke
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
    <div class="header">
        <h1 class="title">Stem van Vandaag</h1>
    </div>
    <MapBox {geoJSONData} {areaProperties} defaultEnabledColor="#4CAF50" />
</div>

<style>
    .app-container {
        position: relative;
        width: 100%;
        min-height: 100vh;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    .header {
        position: absolute;
        width: 100%;
        z-index: 500;
        text-align: center;
        padding-top: 4rem;
        padding-bottom: 4rem;
        background: rgb(255, 255, 255);
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0) 100%
        );
        pointer-events: none;
    }

    .title {
        margin: 0;
        font-size: 4rem;
        font-family: "Cormorant Garamond", serif;
        font-weight: 400;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        overflow: hidden;
    }
</style>
