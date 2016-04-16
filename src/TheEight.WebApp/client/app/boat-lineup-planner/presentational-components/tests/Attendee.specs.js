import Attendee from "../Attendee";
import { mount, shallow } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";

describe("<Attendee />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });
        testUtils.expectToMountWithoutError(Attendee, { attendee });
    });

    it("displays name", () => {
        const attendee = new AttendeeRecord({
            attendeeId: "rower-1",
            displayName: "John Doe"
        });
        
        const wrapper = shallow(<Attendee attendee={attendee} />);
        const text = wrapper.find("div").childAt(0).text();
        expect(text).toBe("John Doe");
    });
});