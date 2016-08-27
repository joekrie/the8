describe("google.com", () => {
  it("should let you search for 'webdriver'", () => {
    browser.url("http://www.google.com/ncr")
    browser.setValue("[name='q']", "webdriver")
    browser.click("[name='btnG']")

    browser.waitUntil(() => browser.getTitle() === "webdriver - Google Search", 5000);
  })
})