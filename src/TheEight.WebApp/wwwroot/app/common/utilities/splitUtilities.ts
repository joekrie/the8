import {XRegExp} from "xregexp";

export function formatSplit(duration: moment.Duration) {
    let split = "";
    split += duration.minutes() + ":";

    if (duration.seconds() < 10) {
        split += "0";
    }

    const seconds = duration.seconds();
    const deciseconds = Math.round(duration.milliseconds() / 100);
    split += `${seconds}.${deciseconds}`;

    return split;
}

export function parseSplit(split: string) {
    const regExp = XRegExp("^(?<minutes>\\d):(?<seconds>[0-5][0-9])(.(?<secondFraction>\\d*)?)?$");
    const res: any = XRegExp.exec(split, regExp);

    if (!res) {
        return null;
    }

    const secondsDecimel = parseFloat(`0.${res.secondFraction}`);
    const milliseconds = secondsDecimel * 1000;

    return moment.duration({
        minutes: res.minutes,
        seconds: res.seconds,
        milliseconds: milliseconds
    });
}