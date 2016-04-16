import App from "../App";
import { mount } from "enzyme";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

describe("Boat lineup planner <App />", () => {
    it("mounts without error", () => testUtils.expectToMountWithoutError(App));

    it("drags and drops", () => {
        const TestComponent = DragDropContext(TestBackend)(App);
        const wrapper = mount(<TestComponent />);
        const component = wrapper.instance();
        const dndBackend = component.getManager().getBackend();


    });
});