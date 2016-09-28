import { Component } from "react"
import { observer, Provider } from "mobx-react"
import DevTools from 'mobx-react-devtools';

import BoatList from "./boat-list"
import AttendeeDragLayer from "./shared/attendee-drag-layer"
import BoatStore from "./state/boat-store"
import AttendeeStore from "./state/attendee-store"
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
        <div className={styles.root}>
          <AttendeeDragLayer />
          <BoatList />
          <DevTools />
        </div>
      </Provider>
    )
  }
}
