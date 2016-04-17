import BoatSeatDropTarget from "../BoatSeatDropTarget";
import AttendeeRecord from "../../records/AttendeeRecord";
import SeatRecord from "../../records/SeatRecord";

describe("<BoatSeatDropTarget />", () => {
    it("mounts without error", () =>
        testUtils.expectToMountWithoutError(BoatSeatDropTarget, {
            attendee: new AttendeeRecord({ attendeeId: "rower-1" }),
            seat: new SeatRecord({
                boatId: "boat-1",
                seatNumber: 2
            })
        })
    );
});