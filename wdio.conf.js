const request = require("request")
const resolve = require("url").resolve

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

if (process.env.APPVEYOR) {
  console.log("Detected AppVeyor")
  const url = resolve(process.env.APPVEYOR_API_URL, "/api/tests")

  config.afterTest = test => {
    const body = {
      "testName": test.fullName,
      "testFramework": "WebdriverIO",
      "fileName": test.file,
      "outcome": test.passed ? "Passed" : "Failed",
      "durationMilliseconds": test.duration
    }

    console.log("Sending test results to AppVeyor")
    console.log(body)

    request({
      url,
      json: true,
      body
    })
  }
}

exports.config = config