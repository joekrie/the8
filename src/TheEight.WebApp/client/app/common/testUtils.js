import { Component } from "react";
import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";

export const applyReactDndTestBackend = DecoratedComponent => {
    @DragDropContext(TestBackend)
    class TestContextContainer extends Component {
        render() {
            return <DecoratedComponent {...this.props} />;
        }
    }

    return TestContextContainer;
}