import BoatSeat from "../BoatSeat";
import AttendeeRecord from "../../records/AttendeeRecord";

describe("<BoatSeat />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });

        const props = {
            attendee,
            boatId: "boat-1",
            seat: 2
        };

        testUtils.expectToMountWithoutError(BoatSeat, props);
    });
});