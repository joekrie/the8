import { mount } from "enzyme";
import { List } from "immutable";
import { DragDropContext } from "react-dnd";
import TestBackend from "react-dnd-test-backend";

import BoatLineupPlannerApp from "../app";

describe("Boat lineup planner app", () => {
  it("renders successfully", () => {
    const App = DragDropContext(TestBackend)(BoatLineupPlannerApp.DecoratedComponent);
    expect(() => mount(App)).not.toThrow();
  });
  
  // it("assigns attendee to boat seat when dragged from attendee list to seat", () => {});
});