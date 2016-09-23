import { Component } from "react"

export default class RadioGroup extends Component {
  render {
    return (
      <label>
        <input type="radio" name={this.props.name}>
        <span class={styles.checkable}>{this.props.label}</span>
      </label>
    )
  }
}
