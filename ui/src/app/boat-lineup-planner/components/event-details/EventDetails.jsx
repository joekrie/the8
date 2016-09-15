import { PropTypes } from "react"
import { observer } from "mobx-react"
import { StyleSheet, css } from "aphrodite"
import classNames from "classnames"

import AttendeeList from "./AttendeeList"

function EventDetails(props) {
  return (
    <div className={classNames("card", css(styles.root))}>
      <AttendeeList />
    </div>
  )
}

const styles = StyleSheet.create({
  root: {
    float: "left",
    width: "275px",
    height: "100%"
  }
})

export default observer(EventDetails)
