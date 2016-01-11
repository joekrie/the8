import "expose?React!react";
import ReactDOM from "react-dom";
import UserInviterApp from "./accounts/user-inviter/App";
import BoatLineupPlannerApp from "./water-events/boat-lineup-planner/App";

ReactDOM.render(
    <BoatLineupPlannerApp  />,
    document.getElementById("app")
);