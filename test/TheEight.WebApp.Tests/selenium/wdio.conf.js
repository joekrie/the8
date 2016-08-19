const baseUrl = "http://localhost:3000"

exports.config = {
  specs: [
    "./tests/**/*.tests.js"
  ],
  exclude: [],
  maxInstances: 10,
  capabilities: [
    {
      maxInstances: 5,
      browserName: "chrome"
    }
  ],
  sync: true,
  logLevel: "result",
  coloredLogs: true,
  screenshotPath: "./results/error-screenshots",
  baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ["selenium-standalone"],
  framework: "jasmine",
  reporters: ["dot", "junit"],
  reporterOptions: {
    junit: {
      outputDir: "./test-results/junit"
    }
  },
  jasmineNodeOpts: {
    defaultTimeoutInterval: 10000
  }
}
