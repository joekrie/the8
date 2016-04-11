jest.unmock("../BoatRecord");
jest.unmock("immutable");

import BoatRecord from "../BoatRecord";

describe("boat-lineup-planner", () => {
    describe("BoatRecord", () => {
        it("can add", () => {
            expect(2 + 2).toBe(4);
        });
    });
});