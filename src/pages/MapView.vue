<template>
  <q-page class="column">
    <div class="q-pa-sm bg-glossy-select" align="center">
      <q-select
        v-model="selectedMapStyle"
        :options="mapStyles"
        label="Harita Stili"
        outlined
        dense
        options-dense
        transition-show="jump-down"
        transition-hide="jump-up"
        style="width: 200px"
        class="custom-map-selector"
        menu-class="custom-map-menu"
      >
        <template v-slot:prepend>
          <q-icon name="layers" color="orange" />
        </template>

        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
            class="q-pa-sm"
          >
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <template v-slot:selected-item="scope">
          <div class="ellipsis">
            <q-icon
              :name="scope.opt.icon"
              size="xs"
              class="q-mr-sm"
              :color="scope.opt.color"
            />
            {{ scope.opt.label }}
          </div>
        </template>
      </q-select>
    </div>
    <div ref="mapContainer" class="map-root"></div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, onUnmounted, watch } from "vue";
import { useQuasar } from "quasar";
import * as L from "leaflet";
import "leaflet.markercluster";
import { createApp } from "vue";

import StationPopup from "src/components/StationPopup.vue";
import { useChargerStore } from "src/stores/charger";

// --- Refs & state ---
const $q = useQuasar();
const mapContainer = ref(null);
const mapInstance = ref(null);
const chargerStore = useChargerStore();

let markers = null; // cluster layer
let selectedMarker = null; // kullanıcı seçtiği nokta
let selectedIcon = null; // yeni icon
let currentLocationMarker = null; // mevcut konum marker
let currentTile = null; // tile layer ref
let chargerIcon = null; // şarj istasyonu icon
let currentIcon = null; // mevcut konum icon

// --- helpers ---
// --- Harita stilleri ---
const mapStyles = [
  {
    label: "Carto Light",
    value: "carto_light",
    icon: "map",
    color: "yellow",
    description: "Varsayılan harita görünümü",
  },
  {
    label: "Carto Dark",
    value: "carto_dark",
    icon: "dark_mode",
    color: "grey",
    description: "Gece görünümü",
  },
  {
    label: "Carto Voyager",
    value: "carto_voyager",
    icon: "satellite",
    color: "green",
    description: "Seyir Görünümü",
  },
];
const selectedMapStyle = ref({
  label: "Carto Light",
  value: "carto_light",
  icon: "map",
  color: "blue",
  description: "Varsayılan harita görünümü",
});

function tileUrl(style) {
  switch (style) {
    case "carto_light":
      return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    case "carto_dark":
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    case "carto_voyager":
      return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    default:
      return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  }
}

async function getUserLocation(defaultLat = 39.9334, defaultLng = 32.8597) {
  if (!navigator.geolocation)
    return { lat: defaultLat, lng: defaultLng, zoom: 6 };
  try {
    const position = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    );
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      zoom: 12,
    };
  } catch {
    return { lat: defaultLat, lng: defaultLng, zoom: 6 };
  }
}

function createPopupComponent(station) {
  const container = document.createElement("div");
  const app = createApp(StationPopup, { station });
  app.mount(container);
  return container;
}

async function loadStations(lat, lng) {
  await chargerStore.fetchStations(lat, lng);
  markers.clearLayers();

  const newMarkers = chargerStore.stations
    .filter((s) => s?.AddressInfo?.Latitude && s?.AddressInfo?.Longitude)
    .map((station) => {
      const pos = [station.AddressInfo.Latitude, station.AddressInfo.Longitude];
      return L.marker(pos, { icon: chargerIcon }).bindPopup(
        createPopupComponent(station)
      );
    });

  markers.addLayers(newMarkers);
}

// custom Leaflet control (locate & fullscreen)
function addCustomControls() {
  const CustomControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd() {
      const container = L.DomUtil.create("div", "leaflet-bar custom-controls");

      // locate button
      const locateBtn = L.DomUtil.create("a", "custom-btn", container);
      locateBtn.href = "#";
      locateBtn.title = "Beni Bul";
      locateBtn.innerHTML = "📍";
      L.DomEvent.on(locateBtn, "click", async (e) => {
        L.DomEvent.stop(e);
        const { lat, lng, zoom } = await getUserLocation();
        mapInstance.value.setView([lat, lng], Math.max(zoom, 13));

        // mevcut konum marker
        if (currentLocationMarker)
          mapInstance.value.removeLayer(currentLocationMarker);
        currentLocationMarker = L.marker([lat, lng], { icon: currentIcon })
          .addTo(mapInstance.value)
          .bindPopup("📍 Mevcut Konum")
          .openPopup();

        loadStations(lat, lng);
      });

      // fullscreen button
      const fsBtn = L.DomUtil.create("a", "custom-btn", container);
      fsBtn.href = "#";
      fsBtn.title = "Tam Ekran";
      fsBtn.innerHTML = "⛶";
      L.DomEvent.on(fsBtn, "click", (e) => {
        L.DomEvent.stop(e);
        const el = mapContainer.value;
        const isFS = document.fullscreenElement != null;
        if (!isFS) el.requestFullscreen?.();
        else document.exitFullscreen?.();
      });

      return container;
    },
  });

  mapInstance.value.addControl(new CustomControl());
}

function setTileLayer(style) {
  if (currentTile) mapInstance.value.removeLayer(currentTile);
  currentTile = L.tileLayer(tileUrl(style), {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: "&copy; OSM &copy; CARTO",
  }).addTo(mapInstance.value);
}

// --- lifecycle ---
onMounted(async () => {
  // mevcut konum icon
  currentIcon = L.icon({
    iconUrl: "/icons/placeholder.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

  // şarj istasyonu icon
  chargerIcon = L.icon({
    iconUrl: "/icons/charger.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

  // seçilen konum icon
  selectedIcon = L.icon({
    iconUrl: "/icons/selected.png", // public/icons/selected.png (kırmızı pin önerilir)
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

  const { lat, lng, zoom } = await getUserLocation();

  mapInstance.value = L.map(mapContainer.value, {
    zoomControl: true,
    preferCanvas: true,
  }).setView([lat, lng], zoom);

  setTileLayer(selectedMapStyle.value.value);

  // cluster layer
  markers = L.markerClusterGroup();
  mapInstance.value.addLayer(markers);

  // mevcut konum marker
  currentLocationMarker = L.marker([lat, lng], { icon: currentIcon })
    .addTo(mapInstance.value)
    .bindPopup("📍 Mevcut Konum");

  // load stations
  await loadStations(lat, lng);

  // map click → seçilen konum marker
  mapInstance.value.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    // eski selectedMarker varsa kaldır
    if (selectedMarker) mapInstance.value.removeLayer(selectedMarker);

    // yeni selectedMarker ekle
    selectedMarker = L.marker([lat, lng], { icon: selectedIcon })
      .addTo(mapInstance.value)
      .bindPopup(`Seçilen konum: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      .openPopup();

    await loadStations(lat, lng);
  });

  addCustomControls();
});

// Dark mode watch: opsiyonel, zaten tile değişimi için ayrı stil seçebiliyoruz
watch(
  () => $q.dark.isActive,
  () => setTileLayer(selectedMapStyle.value)
);

// --- Map style watcher ---
watch(
  () => selectedMapStyle.value,
  (newStyle) => {
    console.log("newStyle", newStyle);
    setTileLayer(newStyle.value);
  }
);
// cleanup
onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.off();
    mapInstance.value.remove();
  }
  if (markers) {
    markers.clearLayers();
    markers = null;
  }
});
</script>

<style>
.map-root {
  flex: 1;
  min-height: 60vh;
}

.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgba(0, 150, 255, 0.18);
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}
.marker-cluster div {
  background: rgba(0, 150, 255, 0.9);
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  line-height: 40px;
  width: 40px;
  height: 40px;
}

.leaflet-bar.custom-controls {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: var(--ctrl-bg, #fff);
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}
.leaflet-bar.custom-controls .custom-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  text-decoration: none;
  background: #f4f6f8;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
}
body.body--dark .leaflet-bar.custom-controls {
  --ctrl-bg: #1f2937;
}
body.body--dark .leaflet-bar.custom-controls .custom-btn {
  background: #111827;
  color: #e5e7eb;
}

.leaflet-control-zoom a {
  border-radius: 8px !important;
}

/* Select'in Style'ı */

.custom-map-selector .q-field__control {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.custom-map-selector .q-field__control:hover {
  border-color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-map-selector .q-field__native {
  font-weight: 500;
}

.custom-map-menu {
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-map-menu .q-item {
  border-radius: 6px;
  margin: 4px;
  transition: all 0.2s ease;
}

.custom-map-menu .q-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.custom-map-menu .q-item__label--caption {
  opacity: 0.8;
}
.bg-glossy-select {
  background: linear-gradient(135deg, #e0eef0 0%, #c7d9e2 100%);
}
</style>
