import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"

import Root from "./components/root.component"

const backend = 
  Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true })
    : HTML5Backend

const BoatLineupPlannerApp = DragDropContext(backend)(Root)
export default BoatLineupPlannerApp
