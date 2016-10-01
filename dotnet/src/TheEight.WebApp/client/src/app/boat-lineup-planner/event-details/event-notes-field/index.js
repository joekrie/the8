import { random } from "lodash"
import { Component } from "react"
import { observable, action } from "mobx"
import { observer } from "mobx-react"

@observer
export default class NotesField extends Component {
  @observable exampleNote

  @action setExampleNote(text) {
    this.exampleNote = text
  }

  componentDidMount() {
    if (!this.exampleNote) {
      this.setExampleNote(this.getRandomNote())
    }
  }

  getRandomNote() {
    const exampleNotes = [
      "Race day!!",
      "6 x 4min w/1min rest",
      "Warmup by pairs to railroad bridge...",
      "Enjoy the sunrise :)"
    ]

    const rnd = random(exampleNotes.length - 1)
    return `e.g., ${exampleNotes[rnd]}`
  }

  onChange(rawValue) {
    const parsedDate = parseLocalDate(rawValue)
    let isValid = false

    if (parsedDate) {
      isValid = true
    }

    this.setState({ rawValue, isValid })
  }

  render() {
    return (
      <fieldset>
        <label>
          Notes
          <textarea className="form-control" rows="5"></textarea>
        </label>
      </fieldset>
    )
  }
}
