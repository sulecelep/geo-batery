<template>
  <div class="station-popup">
    <div class="popup-header">
      <b>{{ station.AddressInfo?.Title || 'Bilinmeyen İstasyon' }}</b>
    </div>

    <div class="popup-row">
      <span class="label">Adres:</span>
      <span>{{ station.AddressInfo?.AddressLine1 || 'N/A' }}</span>
    </div>

    <div class="popup-row">
      <span class="label">Güç:</span>
      <span class="power">{{ station.Connections?.[0]?.PowerKW || 'N/A' }} kW</span>
    </div>

    <div class="popup-row">
      <span class="label">Kullanım:</span>
      <span>{{ station.UsageType?.Title || 'N/A' }}</span>
    </div>

    <div class="popup-actions">
      <a :href="googleMapsUrl" target="_blank" class="btn google">Google Maps</a>
      <a :href="yandexMapsUrl" target="_blank" class="btn yandex">Yandex Maps</a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  station: { type: Object, required: true }
});

const lat = computed(() => props.station?.AddressInfo?.Latitude);
const lng = computed(() => props.station?.AddressInfo?.Longitude);

const googleMapsUrl = computed(() =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat.value},${lng.value}`
);

const yandexMapsUrl = computed(() =>
  `yandexmaps://maps.yandex.ru/?rtext=~${lat.value},${lng.value}&rtt=auto`
);
</script>

<style scoped>
.station-popup { font-family: 'Segoe UI', Arial, sans-serif; max-width: 260px; }
.popup-header { background: #2c3e50; color: #fff; padding: 10px; border-radius: 10px 10px 0 0; }
.popup-row { margin: 8px 0; }
.label { display: inline-block; width: 80px; color: #7f8c8d; }
.power { color: #e74c3c; font-weight: 700; }
.popup-actions { display: flex; gap: 6px; margin-top: 12px; }
.btn { flex: 1; color: #fff; text-align: center; padding: 6px 8px; border-radius: 6px; text-decoration: none; font-size: 13px; }
.google { background: #3498db; }
.yandex { background: #ff0000; }
</style>
