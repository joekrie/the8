import AssignableAttendeeList from "../AssignableAttendeeList";
import { mount } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("<AssignableAttendeeList />", () => {
    it("mounts without error", () => {
        const rowers = List([
            new AttendeeRecord({ attendeeId: "rower-1" })
        ]);

        const coxswains = List([
            new AttendeeRecord({ attendeeId: "cox-1", isCoxswain: true })
        ]);

        const TestComponent = DragDropContext(TestBackend)(AssignableAttendeeList);

        const mountComponent = () => mount(
            <TestComponent rowers={rowers} coxswains={coxswains} />
        );

        expect(mountComponent).not.toThrow();
    });
});