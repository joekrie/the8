import Attendee from "../Attendee";
import { mount } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";

describe("<Attendee />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });

        const mountComponent = () => mount(
            <Attendee attendee={attendee} />
        );

        expect(mountComponent).not.toThrow();
    });
});