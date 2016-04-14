import BoatList from "../BoatList";
import { mount } from "enzyme";
import BoatRecord from "../../records/BoatRecord";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("<BoatList />", () => {
    it("mounts without error", () => {
        const boats = new Map({
            "boat-1": Map({
                boat: new BoatRecord({
                    boatId: "boat-1",
                    seatCount: 2,
                    seatAssignments: Map([
                        [2, "rower-1"]
                    ])
                }),
                attendees: new List([
                    new AttendeeRecord({ attendeeId: "rower-1" })
                ])
            }),
            "boat-2": Map({
                boat: new BoatRecord({
                    boatId: "boat-2"
                }),
                attendees: List()
            })
        });
        
        const TestComponent = DragDropContext(TestBackend)(BoatList);

        const mountComponent = () => mount(
            <TestComponent boats={boats} placeAttendees={jest.fn()} />
        );

        expect(mountComponent).not.toThrow();
    });
});