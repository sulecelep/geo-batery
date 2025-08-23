import { defineStore } from 'pinia';
import axios from 'axios';

export const useChargerStore = defineStore('charger', {
  state: () => ({ stations: [] }),
  actions: {
    async fetchStations(lat, lng) {
      const apiKey = import.meta.env.VITE_OPENCHARGEMAP_API_KEY;
      const response = await axios.get(`https://api.openchargemap.io/v3/poi?output=json&countrycode=TR&maxresults=500&compact=true&verbose=false&latitude=${lat}&longitude=${lng}&distance=50`, {
        headers: { 'X-API-Key': apiKey }
      });
      this.stations = response.data;
    }
  }
});