import { Component } from "react"
import { observer, Provider } from "mobx-react"

import BoatList from "./boat-list"
import AttendeeDragLayer from "./attendee-list/attendee-drag-layer"
import BoatStore from "./boat-list/boat-store"
import AttendeeStore from "./attendee-list/attendee-store"
import dragDropContext from "./dnd"
import styles from "./styles.scss"

@dragDropContext
@observer
export default class Root extends Component {
  boatStore

  constructor() {
    super()

    this.attendeeStore = new AttendeeStore()
    this.boatStore = new BoatStore(this.attendeeStore)
  }

  componentDidMount() {
    this.boatStore.load()
    this.attendeeStore.load()
  }

  render() {
    return (
      <Provider boatStore={this.boatStore} attendeeStore={this.attendeeStore}>
        <div className={`container-fluid ${styles.root}`}>
          <AttendeeDragLayer />
          <BoatList />
        </div>
      </Provider>
    )
  }
}
