import { Component } from "react"
import { observer } from "mobx-react"
import { observable, action } from "mobx"

import AddBoatModal from "./add-boat-modal"
import styles from "./styles.scss"

@observer
export default class Toolbar extends Component {
  @observable addBoatOpen = false

  @action openAddBoat() {
    this.addBoatOpen = true
  }

  @action closeAddBoat() {
    this.addBoatOpen = false
  }

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.buttonGroup}>
          <button onClick={() => this.openAddBoat()}>Add Boat</button>
        </div>
        <AddBoatModal isOpen={this.addBoatOpen} close={() => this.closeAddBoat()} />
      </div>
    )
  }
}
