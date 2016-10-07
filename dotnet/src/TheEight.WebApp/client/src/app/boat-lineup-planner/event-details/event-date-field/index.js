import { Component } from "react"
import rome from "rome"
import { observer } from "mobx-react"
import { observable, action, computed } from "mobx"

import { formatLocalDate, parseLocalDate } from "app/common/utils/date-utils"
import styles from "./styles.scss"

@observer
export default class EventDateField extends Component {
  @observable rawValue
  
  //@computed get parsedValue() {
  //  return parseLocalDate(this.rawValue)
  //}

  componentDidMount() {
    this.datepicker = rome(this.datepickerRef, {
      time: false,
      initialValue: '10/10/2016'
    })
    
    this.datepicker.on("data", newValue => {
      this.rawValue = newValue
    })
  }

  render() {
    return (
      <fieldset>
        <label>
          Date        
          <input ref={ref => this.inputRef = ref} defaultValue={this.rawValue} 
            onChange={evt => this.rawValue = evt.target.value} />
        </label> 
        <div ref={ref => this.datepickerRef = ref}></div>
      </fieldset>
    )
  }
}
