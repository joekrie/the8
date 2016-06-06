import { range } from "lodash";
import { Component } from 'react';

export default class DateDropdowns extends Component {
  constructor() {
    super();
        
    this._months = [
      ["January", "Jan"],
      ["February", "Feb"],
      ["March", "Mar"],
      ["April", "Apr"],
      ["May", "May"],
      ["June", "June"],
      ["July", "July"],
      ["August", "Aug"],
      ["September", "Sept"],
      ["October", "Oct"],
      ["November", "Nov"],
      ["December", "Dec"]
    ];
    
    this._days = [
      ["Sunday", "Sun"],
      ["Monday", "Mon"],
      ["Tuesday", "Tue"],
      ["Wednesday", "Wed"],
      ["Thursday", "Thu"],
      ["Friday", "Fri"],
      ["Saturday", "Sat"]
    ];
  }
  
  render() {
    const { value, abbreviate, label } = this.props;
    
    const monthOptions = months.map((month, index) => <option value={index}>{month[abbreviate ? 1 : 0]}</option>);  
    const getCurrDay = () =>  days[value.getDate()][abbreviate ? 1 : 0];
            
    return (
      <div>
        {getCurrDay()}
        <label>
          {label}
          <select>
            {monthOptions}
          <select>
        </label>
        <label>
          <input value={} />
        </label>
        <label>
          <input value={} />
        </label>
      </div>
    );
  }
}