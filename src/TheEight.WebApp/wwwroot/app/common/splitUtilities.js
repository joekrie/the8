define(["require", "exports", "xregexp"], function (require, exports, xregexp_1) {
    function formatSplit(duration) {
        var split = "";
        split += duration.minutes() + ":";
        if (duration.seconds() < 10) {
            split += "0";
        }
        var seconds = duration.seconds();
        var deciseconds = Math.round(duration.milliseconds() / 100);
        split += seconds + "." + deciseconds;
        return split;
    }
    exports.formatSplit = formatSplit;
    function parseSplit(split) {
        var regExp = xregexp_1.XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$");
        var res = xregexp_1.XRegExp.exec(split, regExp);
        if (!res) {
            return null;
        }
        var secondsDecimel = parseFloat("0." + res.secondFraction);
        var milliseconds = secondsDecimel * 1000;
        return moment.duration({
            minutes: res.minutes,
            seconds: res.seconds,
            milliseconds: milliseconds
        });
    }
    exports.parseSplit = parseSplit;
});
//# sourceMappingURL=splitUtilities.js.map