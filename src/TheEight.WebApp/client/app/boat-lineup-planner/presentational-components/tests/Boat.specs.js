import Boat from "../Boat";
import { mount } from "enzyme";
import BoatRecord from "../../records/BoatRecord";
import { Map } from "immutable";
import { applyReactDndTestBackend } from "../../../common/testUtils";

describe("Boat lineup planner app", () => {
    it("mounts without error", () => {
        const boat = new BoatRecord({
            seatCount: 2,
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        });

        const placeAttendees = jest.fn();
        const TestBoat = applyReactDndTestBackend(Boat);

        const mountComponent = () => mount(
            <TestBoat boat={boat} placeAttendees={placeAttendees} />
        );

        expect(mountComponent).not.toThrow();
    });
});