/* Copyright 2018 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an 'AS IS' BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/
var vz_line_chart2;
(function (vz_line_chart2) {
    let State;
    (function (State) {
        State[State["NONE"] = 0] = "NONE";
        State[State["DRAG_ZOOMING"] = 1] = "DRAG_ZOOMING";
        State[State["PANNING"] = 2] = "PANNING";
    })(State || (State = {}));
    class PanZoomDragLayer extends Plottable.Components.Group {
        /**
         * A Plottable component/layer with a complex interaction for the line chart.
         * When not pressing alt-key, it behaves like DragZoomLayer -- dragging a
         * region zooms the area under the gray box and double clicking resets the
         * zoom. When pressing alt-key, it lets user pan around while having mousedown
         * on the chart and let user zoom-in/out of cursor when scroll with alt key
         * pressed.
         */
        constructor(xScale, yScale, unzoomMethod) {
            super();
            this.state = State.NONE;
            this.panStartCallback = new Plottable.Utils.CallbackSet();
            this.panEndCallback = new Plottable.Utils.CallbackSet();
            this.panZoom = new Plottable.Interactions.PanZoom(xScale, yScale);
            this.panZoom.dragInteraction().mouseFilter((event) => {
                return PanZoomDragLayer.isPanKey(event) && event.button === 0;
            });
            this.panZoom.wheelFilter(this.canScrollZoom);
            this.dragZoomLayer = new vz_line_chart.DragZoomLayer(xScale, yScale, unzoomMethod);
            this.dragZoomLayer.dragInteraction().mouseFilter((event) => {
                return !PanZoomDragLayer.isPanKey(event) && event.button === 0;
            });
            this.append(this.dragZoomLayer);
            const onWheel = this.onWheel.bind(this);
            this.onAnchor(() => {
                this._mouseDispatcher = Plottable.Dispatchers.Mouse.getDispatcher(this);
                this._mouseDispatcher.onWheel(onWheel);
                this.panZoom.attachTo(this);
            });
            this.onDetach(() => {
                this.panZoom.detachFrom(this);
                // onDetach can be invoked before onAnchor
                if (this._mouseDispatcher) {
                    this._mouseDispatcher.offWheel(onWheel);
                    this._mouseDispatcher = null;
                }
            });
            this.panZoom.dragInteraction().onDragStart(() => {
                if (this.state == State.NONE)
                    this.setState(State.PANNING);
            });
            this.panZoom.dragInteraction().onDragEnd(() => {
                if (this.state == State.PANNING)
                    this.setState(State.NONE);
            });
            this.dragZoomLayer.dragInteraction().onDragStart(() => {
                if (this.state == State.NONE)
                    this.setState(State.DRAG_ZOOMING);
            });
            this.dragZoomLayer.dragInteraction().onDragEnd(() => {
                if (this.state == State.DRAG_ZOOMING)
                    this.setState(State.NONE);
            });
        }
        onWheel(_, event) {
            if (this.canScrollZoom(event))
                return;
            const helpContainer = this.element();
            if (!helpContainer.select('.help').empty())
                return;
            const help = helpContainer.append('div').classed('help', true);
            help.append('span').text('Alt + Scroll to Zoom');
            // Please see vz-pan-zoom-style for the definition of the animation.
            help.on('animationend', () => void help.remove());
        }
        static isPanKey(event) {
            return Boolean(event.altKey) || Boolean(event.shiftKey);
        }
        canScrollZoom(event) {
            return event.altKey;
        }
        setState(nextState) {
            if (this.state == nextState)
                return;
            const prevState = this.state;
            this.state = nextState;
            this.root().removeClass(this.stateClassName(prevState));
            this.root().addClass(this.stateClassName(nextState));
            if (prevState == State.PANNING) {
                this.panEndCallback.callCallbacks();
            }
            if (nextState == State.PANNING) {
                this.panStartCallback.callCallbacks();
            }
        }
        stateClassName(state) {
            switch (state) {
                case State.PANNING:
                    return 'panning';
                case State.DRAG_ZOOMING:
                    return 'drag-zooming';
                case State.NONE:
                default:
                    return '';
            }
        }
        onPanStart(cb) {
            this.panStartCallback.add(cb);
        }
        onPanEnd(cb) {
            this.panEndCallback.add(cb);
        }
        onScrollZoom(cb) {
            this.panZoom.onZoomEnd(cb);
        }
        onDragZoomStart(cb) {
            this.dragZoomLayer.interactionStart(cb);
        }
        onDragZoomEnd(cb) {
            this.dragZoomLayer.interactionEnd(cb);
        }
    }
    vz_line_chart2.PanZoomDragLayer = PanZoomDragLayer;
})(vz_line_chart2 || (vz_line_chart2 = {})); // namespace vz_line_chart
