import { defineConfig } from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  

  e2e: {
    "baseUrl": "https://practice.expandtesting.com",
    
    setupNodeEvents(on, config) {
      // aqui você pode adicionar plugins ou listeners
      return config;
    },
    
    viewportWidth: 1336,
    viewportHeight: 960,
  },
});
