const baseUrl = "http://the8-dev.azurewebsites.net"

exports.config = {
  specs: [
    "./tests/**/*.tests.js"
  ],
  exclude: [],
  maxInstances: 10,
  sync: true,
  logLevel: "result",
  coloredLogs: true,
  screenshotPath: "./error-screenshots",
  baseUrl,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: "jasmine",
  jasmineNodeOpts: {
    defaultTimeoutInterval: 10000
  }
}
