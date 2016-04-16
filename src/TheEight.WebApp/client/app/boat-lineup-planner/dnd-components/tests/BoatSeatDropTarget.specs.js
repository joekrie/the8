import BoatSeatDropTarget from "../BoatSeatDropTarget";
import AttendeeRecord from "../../records/AttendeeRecord";

describe("<BoatSeatDropTarget />", () => {
    it("mounts without error", () =>
        testUtils.expectToMountWithoutError(BoatSeatDropTarget, {
            attendee: new AttendeeRecord({ attendeeId: "rower-1" }),
            boatId: "boat-1",
            seat: 2
        })
    );

    it("just works", () => {
        
    });

    it("allows move within boat", () => {
        
    });

});