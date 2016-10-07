import { Component } from "react"

export default class Checkbox extends Component {
  render {
    return (
      <label>
        <input type="checkbox" checked={this.props.value}>
        <span class="checkable">{this.props.label}</span>
      </label>
    )
  }
}
