import App, { TestApp } from "../App";
import { mount } from "enzyme";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("Boat lineup planner <App />", () => {
    it("mounts without error", () => {
        expect(() => mount(<TestApp />)).not.toThrow();
    });

    xit("renders attendees", () => {
        const TestComponent = (TestApp);
        const wrapper = mount(<TestComponent />);
        

    });

    xit("drags and drops", () => {
        const TestComponent = DragDropContext(TestBackend)(App);
        const wrapper = mount(<TestComponent />);
        const component = wrapper.instance();
        const dndBackend = component.getManager().getBackend();


    });
});