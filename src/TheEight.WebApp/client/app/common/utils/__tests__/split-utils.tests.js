import { formatSplit, parseSplit } from "./split-utils"
import { Duration } from "js-joda"
import * as moment from "moment"

describe("common > split-utils >", () => {
  describe("formatSplit", () => {
    it("should format duration = zero", () => {
      // arrange
      const duration = Duration.ofNanos(0)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("0:00.0")
    })

    it("should format duration < 10s", () => {
      // arrange
      const duration = Duration.ofSeconds(1)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("0:01.0")
    })

    it("should format 10s <= duration < 1m", () => {
      // arrange
      const duration = Duration.ofSeconds(10)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("0:10.0")
    })

    it("should format 1m <= duration < 10m", () => {
      // arrange
      const duration = Duration.ofMinutes(1)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("1:00.0")
    })

    it("should format 10m <= duration < 1h", () => {
      // arrange
      const duration = Duration.ofMinutes(10)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("10:00.0")
    })

    it("should format duration >= 1h", () => {
      // arrange
      const duration = Duration.ofHours(1)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("60:00.0")
    })

    it("should format duration with milliseconds", () => {
      // arrange
      const duration = Duration.ofMinutes(1).plusMillis(500)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("1:00.5")
    })
    
    it("should round milliseconds up", () => {
      // arrange
      const duration = Duration.ofMinutes(1).plusMillis(550)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("1:00.6")
    })

    it("should round milliseconds down", () => {
      // arrange
      const duration = Duration.ofMinutes(1).plusMillis(540)

      // act
      const formatted = formatSplit(duration)

      // assert
      expect(formatted).toBe("1:00.5")
    })
  })

  describe("parseSplit", () => {
    it("should parse split = zero", () => {
      // arrange
      const split = "0:00.0"

      // act
      const parsed = parseSplit(split)

      // assert
      const expected = Duration.ofNanos(0)
      expect(parsed).toEqual(expected)
    })

    it("should parse split < 10s", () => {
      // arrange
      const split = "0:05.0"

      // act
      const parsed = parseSplit(split)

      // assert
      const expected = Duration.ofSeconds(5)
      expect(parsed).toEqual(expected)
    })

    it("should parse 10s <= split < 1m", () => {
      // arrange
      const split = "0:30.0"

      // act
      const parsed = parseSplit(split)

      // assert
      const expected = Duration.ofSeconds(30)
      expect(parsed).toEqual(expected)
    })

    it("should parse 1m <= split < 10m", () => {
      // arrange
      const split = "1:30.0"

      // act
      const parsed = parseSplit(split)

      // assert
      const expected = Duration.ofSeconds(90)
      expect(parsed).toEqual(expected)
    })

    it("should parse split without deciseconds", () => {
      // arrange
      const split = "0:05"

      // act
      const parsed = parseSplit(split)

      // assert
      const expected = Duration.ofSeconds(5)
      expect(parsed).toEqual(expected)
    })
  })
})
