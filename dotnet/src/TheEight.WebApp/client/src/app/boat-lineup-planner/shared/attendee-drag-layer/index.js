import { Component } from "react"
import { identity } from "ramda"
import { sync } from "postcss-js"
import autoprefixer from "autoprefixer"

import Attendee from "../attendee"
import dragLayer from "./dnd"
import styles from "./styles.scss"

function getDragItemStyles(currentOffset) {
  if (!currentOffset) {
    return {
      "display": "none"
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`

  const prefixer = sync([ autoprefixer({ browsers: ['last 2 versions'] }) ]);

  return prefixer({
    transform
  })
}

@dragLayer
export default class AttendeeDragLayer extends Component {
  render() {
    const { item, isDragging } = this.props

    if (isDragging && item && item.attendee) {
      return (
        <div className={styles.root}>
          <div className={styles.attendee} style={getDragItemStyles(this.props.currentOffset)}>
            <Attendee attendee={this.props.item.attendee} connectDragPreview={identity} 
              connectDragSource={identity} isDragging={true} />
          </div>
        </div>
      )
    }
    
    return null
  }
}
