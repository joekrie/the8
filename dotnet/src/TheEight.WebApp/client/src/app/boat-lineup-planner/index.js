import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"

import TouchBackend from "react-dnd-touch-backend"
import HTML5Backend from "react-dnd-html5-backend"
import { DragDropContext } from "react-dnd"

import Root from "./components/root.component"

const backend = 
  Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true })
    : HTML5Backend

const BoatLineupPlannerApp = DragDropContext(backend)(Root)
export default BoatLineupPlannerApp
