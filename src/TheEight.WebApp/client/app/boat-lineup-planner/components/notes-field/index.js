import { Component } from "react"

export default class NotesField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newValue: this.props.value,
      isEditing: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      rawValue: nextProps.value.toString(),
      isValid: true
    })

    this.datepicker.setValue(nextProps.value.toString())
  }

  onChange(rawValue) {
    const parsedDate = parseLocalDate(rawValue)
    let isValid = false
    
    if (parsedDate) {
      isValid = true
      this.props.onChange(parsedDate)
    }
    
    this.setState({ rawValue, isValid })
  }

  componentDidMount() {
    $(this.infoRef).tooltip({
      title: "Hint: Try entering 'today' or 'next Monday'",
      placement: "right"
    })

    this.datepicker = rome(this.input, {
      time: false,
      initialValue: this.props.value.toString()
    })
    
    this.datepicker.on("data", newValue => {
      this.onChange(newValue)
    })
  }

  onToggleDatepicker() {
    this.setState({
      isShowingDatepicker: !this.state.isShowingDatepicker
    })
  }

  onOpenEditor() {
    this.setState({
      isEditing: true
    })
  }

  onSave() {
    this.setState({
      isEditing: false
    })  
  }

  render() {
    const { rawValue } = this.state

    const displayParsed = 
      this.state.isValid
        ? <small className="text-muted">{formatLocalDate(this.props.value)}</small>
        : null

    const styles = {
      datepicker: {
        display: this.state.isShowingDatepicker ? "inherit" : "none" 
      },
      display: {
        display: this.state.isEditing ? "none": "inherit"
      },
      edit: {
        display: this.state.isEditing ? "inherit" : "none"
      }
    }

    return (
      <div>
        <div style={styles.display}>
          {formatLocalDate(this.props.value)}
          &nbsp;
          <a href="#" onClick={() => this.onOpenEditor()}>edit</a>
        </div>
        <div style={styles.edit}>
          <fieldset className="form-group">
            <label htmlFor="date">
              Date
              &nbsp;
              <i className="fa fa-info-circle" ref={ref => this.infoRef = ref} aria-hidden="true"></i>
            </label>
            <div className="input-group">
              <input id="date" className="form-control" value={rawValue.toString()} 
                onChange={evt => this.onChange(evt.target.value)} />
              <span className="input-group-btn">
                <button className="btn btn-secondary" type="button" onClick={() => this.onToggleDatepicker()}>
                  <i className="fa fa-calendar" aria-hidden="true"></i>
                </button>
              </span>
            </div>
            <div style={styles.datepicker} ref={ref => this.input = ref}></div>
            {displayParsed}
          </fieldset>
          <button onClick={() => this.onSave()} className="btn btn-secondary btn-sm">
            Save
          </button>
        </div>
      </div>
    )
  }
}
