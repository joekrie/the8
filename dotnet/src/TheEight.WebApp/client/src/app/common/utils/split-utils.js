import XRegExp from "xregexp"
import { Duration } from "js-joda"
import { padStart } from "lodash"

export const formatSplit = duration => {
  let minutes = duration.toMinutes()

  let split = ""
  split += minutes + ":"

  const seconds = duration.seconds() % 60
  const deciseconds = Math.round(duration.nano() / 100000000)
  split += `${padStart(seconds, 2, "0")}.${deciseconds}`

  return split
}

export const parseSplit = split => {
  const regExp = XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$")
  const res = XRegExp.exec(split, regExp)

  if (!res) {
    return null
  }

  const secondsDecimel = parseFloat("0." + res.secondFraction)
  const seconds = res.seconds + secondsDecimel // todo: not used...why? possible missing test cases?
  const isoDuration = `PT${res.minutes}M${res.seconds}S`

  return Duration.parse(isoDuration)
}
