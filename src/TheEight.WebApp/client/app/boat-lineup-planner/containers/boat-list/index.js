import { List } from "immutable"
import { Component } from "react"
import { connect } from "react-redux"

import Boat from "boat-lineup-planner/components/boat"

import { mapStateToProps } from "./redux-specs"

import "./styles.scss"

@connect(mapStateToProps)
export default class BoatList extends Component {
  render() {
    const { boats } = this.props   

    const boatComponents = boats.map(boat => 
      <Boat key={boat.details.boatId} boat={boat} />
    )

    return (
      <div className="boat-list">
        {boatComponents}
      </div>
    )
  }
}

export default BoatList
