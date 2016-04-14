import App from "../App";
import { mount } from "enzyme";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("Boat lineup planner app", () => {
    it("mounts without error", () => {
        const TestComponent = DragDropContext(TestBackend)(App);
        expect(() => mount(<TestComponent />)).not.toThrow();
    });
});