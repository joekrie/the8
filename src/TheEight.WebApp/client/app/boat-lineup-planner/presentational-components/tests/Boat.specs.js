import Boat from "../Boat";
import { mount } from "enzyme";
import BoatRecord from "../../records/BoatRecord";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("<Boat />", () => {
    it("mounts without error", () => {
        const boat = Map({
            boat: new BoatRecord({
                seatCount: 2,
                seatAssignments: Map([
                    [1, "rower-1"]
                ])
            }),
            attendees: List([
                new AttendeeRecord({ attendeeId: "rower-1" })
            ])
        });
        
        const TestComponent = DragDropContext(TestBackend)(Boat);

        const mountComponent = () => mount(
            <TestComponent boat={boat.get("boat")} attendees={boat.get("attendees")} 
                placeAttendees={jest.fn()} />
        );

        expect(mountComponent).not.toThrow();
    });
});