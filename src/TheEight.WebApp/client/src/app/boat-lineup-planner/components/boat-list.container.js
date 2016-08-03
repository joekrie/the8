import { List } from "immutable"
import { Component } from "react"
import { connect } from "react-redux"

import Boat from "boat-lineup-planner/components/boat"

import "./boat-list.container.scss"

export const mapStateToProps = ({ boats }) => ({
  boats: boats.valueSeq()
})

@connect(mapStateToProps)
export default class BoatList extends Component {
  render() {
    const { boats } = this.props   

    const boatComponents = boats.map(boat => 
      <Boat key={boat.boat.boatId} boat={boat} />
    )

    return (
      <div className="boat-list">
        {boatComponents}
      </div>
    )
  }
}

export default BoatList
