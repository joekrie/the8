export default {
  eventSettings: {
    eventId: "event-1",
    title: "",
    allowMultipleAttendeeAssignments: false
  },
  boats: [
      {
        details: {
          boatId: "boat-1",
          title: "Boat 1",
          isCoxed: true,
          seatCount: 2
        },
        assignedSeats: {
          1: "rower-1"
        }
      }
  ],
  attendees: [
      {
        attendeeId: "rower-1",
        displayName: "John Doe",
        sortName: "Doe, John",
        position: "PORT_ROWER"
      }
  ]
}
