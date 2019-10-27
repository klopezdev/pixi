let app;
let floor;
let viewport;
const tables = [];

$(document).ready(function() {

    $( "#dragHandle1" ).draggable();

    app = new PIXI.Application( { width: 1024, height: 768, transparent: true, autoResize: true, antialias: true } );
    app.view.id = "pixi-view";
    $( '#pixi-div' ).append( app.view );

    viewport = setupViewport( 1943, 1304, app );
    resizeViewer();

    floor = PIXI.Sprite.from( "images/Cabanas.png" );
    floor.position.set( -10, -10 );
    viewport.addChild( floor );

    createTable( 1, 20, 35, 40, 0, viewport );
    createTable( 2, 20, 80, 40, 0, viewport );
    createTable( 3, 20, 125, 40, 0, viewport );
    createTable( 4, 20, 170, 40, 0, viewport );
    createTable( 5, 20, 1266, 208, .7, viewport );
    createTable( 6, 20, 1293, 174, .7, viewport );
    createTable( 7, 20, 1348, 128, .95, viewport );
    createTable( 8, 20, 1396, 104, -.3, viewport );
    createTable( 9, 20, 1466, 90, -.02, viewport );

    enableCanvasDragAndDrop( app.view );
    enableSlidePanel();

    window.addEventListener('resize', resizeViewer );
});

function resizeViewer() {

    // Get the p
    const parent = app.view.parentNode;

    // Resize the renderer
    app.renderer.resize( parent.clientWidth, parent.clientHeight );
    viewport.screenWidth = parent.clientWidth;
    viewport.screenHight = parent.cleintHeight;

    setTimeout( function() { resizeViewer(); }, 50 );
}

function createTable( id, height, x, y, rotation, viewport ) {

    const table = viewport.addChild(new PIXI.Sprite( PIXI.Texture.WHITE ));
    table.width = table.height = height;
    table.position.set( x, y );
    table.rotation = rotation;
    table.roundPixels = true;

    table.tableId = id;

    enableSpriteDragAndDrop( table );

    tables.push( table );

    return table;
}

function setupViewport( width, height, app ) {
    var viewport = new Viewport.Viewport({
        screenWidth: $( '#pixi-div' ).innerWidth(),
        screenHeight: $( '#pixi-div' ).innerHeight(),
        worldWidth: width,
        worldHeight: height,

        interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled

    });

    // add the viewport to the stage
    app.stage.addChild(viewport)

    // activate plugins
    viewport
        .drag()
        .pinch()
        .wheel()
        .bounce()
        .clampZoom( { maxWidth: 1924 } );

    return viewport;
}

function enableSpriteDragAndDrop( sprite ) {
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.click = function (e) {
        console.log(this, e);
    }

    sprite
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
}

function onDragStart(event)
{   
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
    event.stopPropagation()
}

function onDragEnd()
{
    this.alpha = 1;

    this.dragging = false;

    // set the interaction data to null
    this.data = null;
}

function onDragMove()
{
    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
    }
}

function dropIntoPixi( event, ui ) {

    let cursorX = event.pageX;
    let cursorY = event.pageY;
    let canvasX = event.target.offsetLeft;
    let canvasY = event.target.offsetTop;

    let dropX = cursorX - canvasX;
    let dropY = cursorY - canvasY;

    let pixiPoint = new PIXI.Point( dropX, dropY );

    var table = tables.find( function( table ) { return table.containsPoint( pixiPoint ); } );

    if ( table != null ) {
        alert( "Seating " + ui.draggable[0].innerText + " at table " + table.tableId );
    } else {
        alert( "Table not selected, refusing to seat " + ui.draggable[0].innerText );
    }
}

function enableCanvasDragAndDrop( view ) {
    $( '.reservations-item' ).draggable({
        helper: 'clone'
    });

    $( '#pixi-view' ).droppable({
        drop:dropIntoPixi
    });
}

var open = false;
function enableSlidePanel() {
    $( '#click' ).click( function() {
        $( "#leftSide" ).animate( { width:'toggle' } , 100 );

        open = !open;
        $( "#click" ).css( { left: open ? 210 : 0 } );
        $( "#click" ).html( open ? "&#9664;" : "&#9654;" );
        $( "#pixi-div" ).css( { marginLeft: open ? 210 : 0 } );

        setTimeout( function() { resizeViewer(); } );
    } );
}
