import BoatSeat from "../BoatSeat";
import AttendeeRecord from "../../records/AttendeeRecord";
import SeatRecord from "../../records/SeatRecord";

describe("<BoatSeat />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });

        const props = {
            attendee,
            seat: new SeatRecord({
                boatId: "boat-1",
                seatNumber: 2
            })
        };

        testUtils.expectToMountWithoutError(BoatSeat, props);
    });
});