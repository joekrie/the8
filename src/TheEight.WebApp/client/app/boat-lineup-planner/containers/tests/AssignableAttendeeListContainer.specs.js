jest.unmock("../AssignableAttendeeListContainer");

import { mapStateToProps } from "../AssignableAttendeeListContainer";

describe("AssignableAttendeeListContainer", () => {
    it("can add", () => {
        expect(2 + 2).toBe(4);
    });
});