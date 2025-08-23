<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="glossy-navbar">
        <!-- Logo ve Uygulama Adı -->
        <div class="row items-center no-wrap">
          <img src="/icons/charger.png" />

          <q-toolbar-title
            class="text-weight-bold"
            style="font-family: Georgia, 'Times New Roman', Times, serif"
          >
            Şarj İstasyonu
            <q-badge align="top" color="accent">v0.0.1</q-badge>
          </q-toolbar-title>
        </div>
        <q-space />

        <!-- Install Butonu -->
        <q-btn
          align="right"
          v-if="deferredPrompt"
          color="glossy-navbar"
          flat
          icon="download"
          @click="installPWA"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";

const deferredPrompt = ref(null);

onMounted(() => {
  // Tarayıcı PWA kriterlerini sağladığında tetiklenen event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // otomatik prompt’u engelle
    deferredPrompt.value = e; // buton göstermek için sakla
  });
});

const installPWA = async () => {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt(); // kullanıcıya yükleme prompt’u göster
  const { outcome } = await deferredPrompt.value.userChoice;
  console.log("PWA install sonucu:", outcome);
  deferredPrompt.value = null; // butonu gizle
};
</script>

<style scoped>
/* Özel stiller */
.q-toolbar {
  min-height: 64px;
  padding: 0 16px;
}

.glossy-navbar {
  background: linear-gradient(135deg, #0860b8 0%, #22daee 100%);
}

::v-deep(.q-header .q-layout__shadow:after) {
  box-shadow: none;
}

/* Buton hover efektleri */
.q-btn--flat:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Badge pozisyonu */
.q-badge {
  font-size: 0.6em;
  vertical-align: super;
}
</style>
