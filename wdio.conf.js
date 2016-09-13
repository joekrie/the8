const request = require("request")

const config = {
  specs: [
    "./e2e-tests/**/*.tests.js"
  ],
  exclude: [],
  maxInstances: 10,
  sync: true,
  logLevel: "result",
  coloredLogs: true,
  screenshotPath: "./e2e-tests/error-screenshots",
  baseUrl: "http://the8-dev.azurewebsites.net",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: "jasmine",
  jasmineNodeOpts: {
    defaultTimeoutInterval: 10000
  },
  reporters: ["spec"],
  reporterOptions: {
    outputDir: "./e2e-tests/test-results"
  },
  services: ["phantomjs"],
  capabilities: [
    {
      maxInstances: 5,
      browserName: "chrome"
    }
  ],
  afterTest: test => console.log(test)
}

if (process.env.CI) {
  config.afterTest = test => {
    request({
      url: `${process.env.APPVEYOR_API_URL}api/tests`,
      json: true,
      body: {
        "testName": test.fullName,
        "testFramework": "WebdriverIO",
        "fileName": test.file,
        "outcome": test.passed ? "Passed" : "Failed",
        "durationMilliseconds": test.duration
      }
    })
  }
}

exports.config = config