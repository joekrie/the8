import "browsernizr/test/touchevents"
import Modernizr from "browsernizr"
import { DragDropContext } from "react-dnd"
import TouchBackend from "react-dnd-touch-backend"
import HTML5Backend from "react-dnd-html5-backend"

const dragDropContext = DragDropContext(
  Modernizr.touchevents 
    ? TouchBackend({ enableMouseEvents: true }) 
    : HTML5Backend
)

export default dragDropContext
