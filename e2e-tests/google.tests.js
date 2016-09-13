jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

describe("google.com", () => {
  it("should let you search for 'webdriver'", () => {
    browser.url("http://www.google.com/ncr")
    browser.setValue("[name='q']", "webdriver")
    browser.click("[name='btnG']")

    browser.waitUntil(() => browser.getTitle() === "webdriver - Google SearchX", 5000)
  })
})

describe("boat lineup planner", () => {
  it("loads the page", () => {
    browser.url("/water-events/boat-lineups/00000000-0000-0000-0000-000000000000")
  })
})
