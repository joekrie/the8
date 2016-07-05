import XRegExp from "xregexp"
import * as moment from "moment"  // todo: replace with js-joda

export const formatSplit = duration => {
    let minutes = duration.minutes()
    minutes += duration.hours() * 60

    var split = ""
    split += minutes + ":"

    if (duration.seconds() < 10) {
        split += "0"
    }

    var seconds = duration.seconds()
    var deciseconds = Math.round(duration.milliseconds() / 100)
    split += `${seconds}.${deciseconds}`

    return split
}

export const parseSplit = split => {
    var regExp = XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$")
    var res = XRegExp.exec(split, regExp)

    if (!res) {
        return null
    }

    var secondsDecimel = parseFloat("0." + res.secondFraction)
    var milliseconds = secondsDecimel * 1000

    return moment.duration({
        minutes: res.minutes,
        seconds: res.seconds,
        milliseconds: milliseconds
    })
}
