function parseSplit(split) {
    var regExp = XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$");
    var res = XRegExp.exec(split, regExp);

    if (!res) {
        return null;
    }

    var secondsDecimel = parseFloat(`0.${res.secondFraction}`);
    var milliseconds = secondsDecimel * 1000;

    return moment.duration({
        minutes: res.minutes,
        seconds: res.seconds,
        milliseconds: milliseconds
    });
}