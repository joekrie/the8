import "expose?React!react";
import ReactDOM from "react-dom";
import UserInviterApp from "./accounts/user-inviter/App";
import BoatLineupPlannerApp from "./water-events/boat-lineup-planner/App";

const event = {
    settings: {
        allowMultipleAssignments: false
    },
    boats: [
        {
            boatId: "club-boat-1",
            title: "Lucky",
            isCoxed: true,
            seatCount: 8,
            seatAssignments: {
                0: "squad-member-5"
            }
        },
        {
            boatId: "club-boat-2",
            title: "Longhorn",
            isCoxed: false,
            seatCount: 4,
            seatAssignments: {
                3: "squad-member-2"
            }
        }
    ],
    attendees: [
        {
            attendeeId: "squad-member-2",
            displayName: "John Doe",
            sortName: "Doe, John",
            position: "COXSWAIN"
        },
        {
            attendeeId: "squad-member-5",
            displayName: "Billy Madison",
            sortName: "Madison, Billy",
            position: "ROWER"
        },
        {
            attendeeId: "anonymous-1",
            displayName: "Abe Lincoln",
            sortName: "Lincoln, Abe",
            position: "ROWER"
        }
    ]
};

ReactDOM.render(
    <BoatLineupPlannerApp event={event} />,
    document.getElementById("app")
);