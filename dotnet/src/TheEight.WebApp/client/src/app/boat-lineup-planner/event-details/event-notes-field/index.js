import { random } from "lodash"
import { Component } from "react"

export default class NotesField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      exampleNote: ""
    }
  }

  componentDidMount() {
    if (!this.state.exampleNote) {
      const exampleNote = this.getRandomNote()
      this.setState({ exampleNote })
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
    const note = exampleNotes[rnd]
    return `e.g., ${note}`
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
      <fieldset className="form-group">
        <label htmlFor="event-details-notes">
          Notes
        </label>
        <textarea className="form-control" id="event-details-notes" rows="5"></textarea>
      </fieldset>
    )
  }
}
