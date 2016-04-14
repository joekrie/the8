import BoatSeatDropTarget from "../BoatSeatDropTarget";
import { mount } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("<BoatSeatDropTarget />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });
        const TestComponent = DragDropContext(TestBackend)(BoatSeatDropTarget);

        const mountComponent = () => mount(
            <TestComponent attendee={attendee} boatId={"boat-1"} seat={2} />
        );

        expect(mountComponent).not.toThrow();
    });
});