function formatSplit(duration) {
    var split = "";
    split += duration.minutes() + ":";

    if (duration.seconds() < 10) {
        split += "0";
    }

    var seconds = duration.seconds();
    var deciseconds = Math.round(duration.milliseconds() / 100);
    split += `${seconds}.${deciseconds}`;

    return split;
}