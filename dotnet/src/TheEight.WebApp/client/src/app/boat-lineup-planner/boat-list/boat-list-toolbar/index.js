import { Component } from "react"

function BoatListToolbar(props) {
  return (
    <div class="boat-list-toolbar">
      <button class="btn btn-default">
        Add boat
      </button>
      <button class="btn btn-default">
        Reorder boats
      </button>
      <button class="btn btn-default">
        Undo
      </button>
      <button class="btn btn-default">
        Redo
      </button>
    </div>
  )
}
