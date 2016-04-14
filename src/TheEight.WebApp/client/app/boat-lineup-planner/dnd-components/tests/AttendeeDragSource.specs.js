import AttendeeDragSource from "../AttendeeDragSource";
import { mount } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("<AttendeeDragSource />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });
        const TestComponent = DragDropContext(TestBackend)(AttendeeDragSource);

        const mountComponent = () => mount(
            <TestComponent attendee={attendee} />
        );

        expect(mountComponent).not.toThrow();
    });
});