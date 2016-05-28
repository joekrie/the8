import { List } from "immutable";

import { mapStateToProps } from "../assigned-attendee-container";
import AttendeeRecord from "../../models/attendee-record";

describe("<AssignedAttendeeContainer />", () => {
  describe("mapStateToProps", () => {
    it("maps the state like a boss", () => {
      const state = {
        attendees: List([
          new AttendeeRecord({
            attendeeId: "rower-1"
          }),
          new AttendeeRecord({
            attendeeId: "rower-2"
          })          
        ])
      };
      
      const ownProps = {
        attendeeId: "rower-1"
      }
      
      const { attendee } = mapStateToProps(state, ownProps);
      
      expect(attendee.attendeeId).toBe("rower-1");
    });
  });
});