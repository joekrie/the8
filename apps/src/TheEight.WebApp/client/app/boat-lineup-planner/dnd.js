import { DragDropContext } from "react-dnd"
import TouchBackend from "react-dnd-touch-backend"

const dragDropContext = DragDropContext(
  TouchBackend({ enableMouseEvents: true })
)

export default dragDropContext
