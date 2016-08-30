import { Component } from "react"

import "./BoatListToolbar.scss"

function BoatListToolbar(props) {
  return (
    <div class="boat-list-toolbar">
      <button class="btn btn-default">
        Add boat
      </button>
      <button class="btn btn-default">
        Reorder boats
      </button>
    </div>
  )
}
