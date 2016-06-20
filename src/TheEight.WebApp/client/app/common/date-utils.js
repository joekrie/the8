import { capitalize } from "lodash"
import { LocalDate, nativeJs } from "js-joda"
import "sugar"

export const formatLocalDate = localDate => {
  const dow = capitalize(localDate.dayOfWeek())
  const mon = capitalize(localDate.month().toString())
  const day = localDate.dayOfMonth()
  const year = localDate.year()
  return `${dow}, ${mon} ${day}, ${year}`
}

export const parseLocalDate = rawDate => {
  const parsedDate = Date.create(rawDate)
  const isValid = parsedDate.isValid()

  if (!isValid) {
    return null
  }

  const localDate = LocalDate.from(nativeJs(parsedDate))
  return localDate
}