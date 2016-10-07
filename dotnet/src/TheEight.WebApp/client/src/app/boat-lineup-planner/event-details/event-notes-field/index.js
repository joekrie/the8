import { random } from "lodash"
import { Component } from "react"
import { observable, action } from "mobx"
import { observer } from "mobx-react"

@observer
export default class NotesField extends Component {
  @observable exampleNote

  componentDidMount() {
    if (!this.exampleNote) {
      const exampleNotes = [
        "Race day!!",
        "6 x 4min w/1min rest",
        "Warmup by pairs to railroad bridge...",
        "Enjoy the sunrise :)"
      ]

      const rnd = random(exampleNotes.length - 1)
      this.exampleNote = `e.g., ${exampleNotes[rnd]}`
    }
  }

  render() {
    return (
      <fieldset>
        <label>
          Notes
          <textarea rows="5"></textarea>
        </label>
      </fieldset>
    )
  }
}
