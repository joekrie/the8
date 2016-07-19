import XRegExp from "xregexp"
import { Duration } from "js-joda"

export const formatSplit = duration => {
    let minutes = duration.minutes()
    minutes += duration.hours() * 60

    const split = ""
    split += minutes + ":"

    if (duration.seconds() < 10) {
        split += "0"
    }

    const seconds = duration.seconds()
    const deciseconds = Math.round(duration.milliseconds() / 100)
    split += `${seconds}.${deciseconds}`

    return split
}

export const parseSplit = split => {
    const regExp = XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$")
    const res = XRegExp.exec(split, regExp)

    if (!res) {
        return null
    }

    const secondsDecimel = parseFloat("0." + res.secondFraction)
    const seconds = res.seconds + secondsDecimel
    const isoDuration = `PT${res.minutes}M${res.seconds}S`

    return Duration.parse(isoDuration)
}
