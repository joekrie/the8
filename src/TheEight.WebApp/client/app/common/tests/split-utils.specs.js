import { formatSplit, parseSplit } from "../splitUtils";
import * as moment from "moment";

describe("Split utilities", () => {
    describe("formatSplit", () => {
        it("formats duration = zero", () => {
            const duration = moment.duration();
            const formatted = formatSplit(duration);
            expect(formatted).toBe("0:00.0");
        });

        it("formats duration < 10s", () => {
            const duration = moment.duration({ seconds: 1 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("0:01.0");
        });
        
        it("formats 10s <= duration < 1m", () => {
            const duration = moment.duration({ seconds: 10 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("0:10.0");
        });
        
        it("formats 1m <= duration < 10m", () => {
            const duration = moment.duration({ minutes: 1 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("1:00.0");
        });
        
        it("formats 10m <= duration < 1h", () => {
            const duration = moment.duration({ minutes: 10 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("10:00.0");
        });

        it("formats duration >= 1h", () => {
            const duration = moment.duration({ hours: 1 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("60:00.0");
        });

        it("formats duration with milliseconds", () => {
            const duration = moment.duration({ minutes: 1, milliseconds: 500 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("1:00.5");
        });
        
        it("rounds milliseconds up", () => {
            const duration = moment.duration({ minutes: 1, milliseconds: 550 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("1:00.6");
        });

        it("rounds milliseconds down", () => {
            const duration = moment.duration({ minutes: 1, milliseconds: 540 });
            const formatted = formatSplit(duration);
            expect(formatted).toBe("1:00.5");
        });
    });

    describe("parseSplit", () => {
        it("parses split = zero", () => {
            const split = "0:00.0";
            const parsed = parseSplit(split);
            const expected = moment.duration();
            expect(parsed).toEqual(expected);
        });
        
        it("parses split < 10s", () => {
            const split = "0:05.0";
            const parsed = parseSplit(split);
            const expected = moment.duration({ seconds: 5 });
            expect(parsed).toEqual(expected);
        });
        
        it("parses 10s <= split < 1m", () => {
            const split = "0:30.0";
            const parsed = parseSplit(split);
            const expected = moment.duration({ seconds: 30 });
            expect(parsed).toEqual(expected);
        });
             
        it("parses 1m <= split < 10m", () => {
            const split = "1:30.0";
            const parsed = parseSplit(split);
            const expected = moment.duration({ minutes: 1, seconds: 30 });
            expect(parsed).toEqual(expected);
        });
                  
        it("parses split without deciseconds", () => {
            const split = "0:05";
            const parsed = parseSplit(split);
            const expected = moment.duration({ seconds: 5 });
            expect(parsed).toEqual(expected);
        });
    });
});