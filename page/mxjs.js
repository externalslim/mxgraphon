// Program starts here. Creates a sample graph in the
// DOM node with the specified ID. This function is invoked
// from the onLoad event handler of the document (see below).
function main() {
    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('images/green-dot.gif', 14, 14);

    // Checks if browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        // Creates the div for the toolbar
        var tbContainer = document.createElement('div');
        tbContainer.style.position = 'absolute';
        tbContainer.style.overflow = 'hidden';
        tbContainer.style.padding = '2px';
        tbContainer.style.left = '0px';
        tbContainer.style.top = '26px';
        tbContainer.style.width = '24px';
        tbContainer.style.bottom = '0px';

        document.body.appendChild(tbContainer);

        // Creates new toolbar without event processing
        var toolbar = new mxToolbar(tbContainer);
        toolbar.enabled = false

        // Creates the div for the graph
        container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.overflow = 'hidden';
        container.style.left = '24px';
        container.style.top = '26px';
        container.style.right = '0px';
        container.style.bottom = '0px';
        container.style.background = 'url("editors/images/grid.gif")';
        mxEvent.disableContextMenu(container);


        // Workaround for Internet Explorer ignoring certain styles
        if (mxClient.IS_QUIRKS) {
            document.body.style.overflow = 'hidden';
            new mxDivResizer(tbContainer);
            new mxDivResizer(container);
        }
        document.body.appendChild(container);

        // Creates the model and the graph inside the container
        // using the fastest rendering available on the browser
        var model = new mxGraphModel();
        var graph = new mxGraph(container, model);
        graph.dropEnabled = true;

        mxSelectionCellsHandler.prototype.destroy = function (a) {
            console.log(a);
        }

        // Matches DnD inside the graph
        mxDragSource.prototype.getDropTarget = function (graph, x, y) {
            var cell = graph.getCellAt(x, y);

            if (!graph.isValidDropTarget(cell)) {
                cell = null;
            }

            return cell;
        };

        // Enables new connections in the graph
        graph.setConnectable(true);
        graph.setTooltips(true);
        graph.setMultigraph(false);
        var layout = new mxParallelEdgeLayout(graph);
        var layoutMgr = new mxLayoutManager(graph);
        
        layoutMgr.getLayout = function(cell)
       {
           if (cell.getChildCount() > 0)
           {
               return layout;
           }
       };


        var addVertex = function (icon, w, h, style) {
            var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
            vertex.setVertex(true);

            addToolbarItem(graph, toolbar, vertex, icon);
        };

        addVertex('editors/images/swimlane.gif', 120, 160, 'shape=swimlane;startSize=20;');
        addVertex('editors/images/rectangle.gif', 100, 40, '');
        addVertex('editors/images/rounded.gif', 100, 40, 'shape=rounded');
        addVertex('editors/images/ellipse.gif', 40, 40, 'shape=ellipse');
        addVertex('editors/images/rhombus.gif', 40, 40, 'shape=rhombus');
        addVertex('editors/images/triangle.gif', 40, 40, 'shape=triangle');
        addVertex('editors/images/cylinder.gif', 40, 40, 'shape=cylinder');
        toolbar.addLine();

        var rubberband = new mxRubberband(graph);
        var keyHandler = new mxKeyHandler(graph);
        keyHandler.bindKey(46, function (evt) {
            if (graph.isEnabled()) {
                graph.removeCells();
            }
        });


        var style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector;

        graph.alternateEdgeStyle = 'elbow=vertical';

        // Installs a custom tooltip for cells
        graph.getTooltipForCell = function (cell) {
            return 'Doubleclick and right- or shiftclick';
        }

        // Installs a popupmenu handler using local function (see below).
        graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
            return createPopupMenu(graph, menu, cell, evt);
        };

        graph.centerZoom = false;
        document.body.appendChild(mxUtils.button('Zoom In', function () {
            graph.zoomIn();
        }));

        document.body.appendChild(mxUtils.button('Zoom Out', function () {
            graph.zoomOut();
        }));
    }
}

function createPopupMenu(graph, menu, cell, evt) {
    if (cell != null) {
        menu.addItem('Değer Görüntüle', 'editors/images/image.gif', function () {
            $('.cell-header').html(cell.mxObjectId);
            if (cell.value != null) {
                $('.value').html(cell.value);
            }
            $('#exampleModal').modal('toggle');
        });
    }
   
    // menu.addItem('MenuItem3', '../src/images/warning.gif', function () {
    //     mxUtils.alert('MenuItem3: ' + graph.getSelectionCount() + ' selected');
    // });
};

function addToolbarItem(graph, toolbar, prototype, image) {
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function (graph, evt, cell) {
        graph.stopEditing(true);

        var pt = graph.getPointForEvent(evt);
        var vertex = graph.getModel().cloneCell(prototype);
        vertex.geometry.x = pt.x;
        vertex.geometry.y = pt.y;

        graph.setSelectionCells(graph.importCells([vertex], 0, 0, cell));
    }

    // Creates the image which is used as the drag icon (preview)
    var img = toolbar.addMode(null, image, funct);
    mxUtils.makeDraggable(img, graph, funct);
}
