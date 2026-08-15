const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    supportFile: false,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: false,
  },
});
