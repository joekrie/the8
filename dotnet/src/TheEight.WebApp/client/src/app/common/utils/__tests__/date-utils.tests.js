import { LocalDate } from "js-joda"

import { parseLocalDate } from "../date-utils"

describe("common > date-utils >", () => {
  describe("parseLocalDate", () => {
    it("should parse a date", () => {
      // arrange
      const raw = "Jan 1, 2015"

      // act
      const parsed = parseLocalDate(raw)

      // assert
      const expected = LocalDate.of(2015, 1, 1)
      expect(parsed).toEqual(expected)
    })
  })
})
