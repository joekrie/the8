import { Component } from "react"

export default class Textbox extends Component {
  render {
    if (this.props.multiline) {
      return (
        <label>
          {this.props.label}
          <textarea class={styles.textbox} type="radio" name={this.props.name}></textarea>
        </label>
      )
    }
    
    return (
      <label>
        {this.props.label}
        <input class={styles.textbox} type="radio" name={this.props.name} />
      </label>
    )
  }
}
