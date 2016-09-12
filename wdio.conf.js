exports.config = {
  specs: [
    "./e2e-tests/**/*.tests.js"
  ],
  exclude: [],
  maxInstances: 10,
  sync: true,
  logLevel: "result",
  coloredLogs: true,
  screenshotPath: "./error-screenshots",
  baseUrl: "http://the8-dev.azurewebsites.net",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: "jasmine",
  jasmineNodeOpts: {
    defaultTimeoutInterval: 10000
  },
  reporters: ["spec", "json"],
  reporterOptions: {
    outputDir: "./e2e-tests/test-results"
  },
  services: ["selenium-standalone"],
  capabilities: [
    {
      maxInstances: 5,
      browserName: "chrome"
    }
  ]
}
