import BoatList from "../BoatList";
import { mount } from "enzyme";
import BoatRecord from "../../records/BoatRecord";
import { List } from "immutable";

describe("Boat lineup planner app", () => {
    it("mounts without error", () => {
        const boats = new List([
            new BoatRecord({ boatId: "boat-1" }),
            new BoatRecord({ boatId: "boat-2" })
        ]);

        const placeAttendees = jest.fn();

        const mountComponent = () => mount(
            <BoatList boats={boats} placeAttendees={placeAttendees} />
        );

        expect(mountComponent).not.toThrow();
    });
});