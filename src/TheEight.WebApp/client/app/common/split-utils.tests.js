import { formatSplit, parseSplit } from "./split-utils"
import { Duration } from "js-joda"
import * as moment from "moment"

describe("common > split-utils >", () => {
  describe("formatSplit", () => {
    it("formats duration = zero", () => {
      const duration = Duration.ofNanos(0)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("0:00.0")
    })

    it("formats duration < 10s", () => {
      const duration = Duration.ofSeconds(1)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("0:01.0")
    })
    
    it("formats 10s <= duration < 1m", () => {
      const duration = Duration.ofSeconds(10)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("0:10.0")
    })
    
    it("formats 1m <= duration < 10m", () => {
      const duration = Duration.ofMinutes(1)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("1:00.0")
    })
    
    it("formats 10m <= duration < 1h", () => {
      const duration = Duration.ofMinutes(10)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("10:00.0")
    })

    it("formats duration >= 1h", () => {
      const duration = Duration.ofHours(1)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("60:00.0")
    })

    it("formats duration with milliseconds", () => {
      const duration = Duration.ofMinutes(1).plusMillis(500)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("1:00.5")
    })
    
    it("rounds milliseconds up", () => {
      const duration = Duration.ofMinutes(1).plusMillis(550)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("1:00.6")
    })

    it("rounds milliseconds down", () => {
      const duration = Duration.ofMinutes(1).plusMillis(540)
      const formatted = formatSplit(duration)
      expect(formatted).toBe("1:00.5")
    })
  })

  describe("parseSplit", () => {
    it("parses split = zero", () => {
      const split = "0:00.0"
      const parsed = parseSplit(split)
      const expected = Duration.ofNanos(0)
      expect(parsed).toEqual(expected)
    })
    
    it("parses split < 10s", () => {
      const split = "0:05.0"
      const parsed = parseSplit(split)
      const expected = Duration.ofSeconds(5)
      expect(parsed).toEqual(expected)
    })
    
    it("parses 10s <= split < 1m", () => {
      const split = "0:30.0"
      const parsed = parseSplit(split)
      const expected = Duration.ofSeconds(30)
      expect(parsed).toEqual(expected)
    })
            
    it("parses 1m <= split < 10m", () => {
      const split = "1:30.0"
      const parsed = parseSplit(split)
      const expected = Duration.ofSeconds(90)
      expect(parsed).toEqual(expected)
    })
                
    it("parses split without deciseconds", () => {
      const split = "0:05"
      const parsed = parseSplit(split)
      const expected = Duration.ofSeconds(5)
      expect(parsed).toEqual(expected)
    })
  })
})