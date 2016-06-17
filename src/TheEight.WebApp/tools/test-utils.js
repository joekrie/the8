import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";
import { mount } from "enzyme";

export const expectToMountWithoutError = (Component, props = {}) => {
    const TestComponent = DragDropContext(TestBackend)(Component);
    expect(() => mount(<TestComponent {...props} />)).not.toThrow();
};