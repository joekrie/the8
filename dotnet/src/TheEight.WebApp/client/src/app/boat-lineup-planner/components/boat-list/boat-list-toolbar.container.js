import { Component } from "react"

import "./boat-list-toolbar.container.scss"

function BoatListToolbar(props) {
  return (
    <div class="boat-list-toolbar">
      <button>
        Add boat
      </button>
      <button>
        Reorder boats
      </button>
    </div>
  )
}
