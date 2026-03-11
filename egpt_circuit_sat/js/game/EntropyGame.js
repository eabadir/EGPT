
/**
 * EntropyGame.js - A class to set-up the UI and experiments for different EGPT simulations. 
 
 * The simulations are rendered in a P5.js canvas. A simulation (like the DoubleSlit experiment) is responsible for declaring
 * its starting objects (walls/slits) and per tick objects (quanta shot from a quantum gun), and its dimensions (e.g. layer 0, and layer 5). All simulations use the same underlying doTick() function
 * such that they share the same physics engine and rendering system. Experiment specific setup and general UI set-up are handled separately from doTick() (see, e.g., 
 * setupUI() function which sets up the UI controls for the simulation, and, e.g., setupDoubleSlit() function which sets up the double slit experiment experiment).
 */
//This is a little hacky since P5.js doesn't play nicely with ES6 classes and object references between js files don't work as expected. The EntropyGameObject needs a reference to the EntropyGame instance so we set this global variable to the EntropyGame instance instead of passing it as a parameter to every game object constructor.

class EntropyGame {
  constructor(viewport_width, viewport_height, canvas_width, canvas_height, uiSetupFunctor = null) {
    //the canvas should occupy 80% of the screen width 
    //scale the canvas to fit in the left panel (80% of the screen width)
    this.default_scale = 1;
    this.scale = this.default_scale;
    this.defaultFPS = 60;
    this.fps = this.defaultFPS;
    scale(this.scale);

    let contentArea = document.getElementById('content-area');
    let screen_width = contentArea ? contentArea.clientWidth : window.innerWidth;
    let screen_height = contentArea ? contentArea.clientHeight : window.innerHeight;
    //view_port is what the user sees, the screen is the entire browser screen, the canvas is the canvas is the drawing area (only some of which is visible in the viewport)
    this.resetCanvasAndControlsRects(viewport_width, viewport_height, screen_width, screen_height, canvas_width, canvas_height);
    this._uiSetupFunctor = uiSetupFunctor;
    if (!this._uiSetupFunctor) {
      this._uiSetupFunctor = this.defaultUIsetup;
    }


    this.withFrames;
    this.quantum_emitter;
    this.pausePlayButton;
    this.screenCapButton;
    this.framerateSlider;

    this.zoomSlider;
    this.withQuantumAutoFire;
    this.isLooping = false;
    this.treeIsShown = false;
    this.showTree;
    this.showQuantumDistributionButton;
    this.hit_count_chart;

    this.ui = {};

    this.quantum_emitter;

    this.treeIsShown = false;

    // Create the canvas using the canvas_rect coordinates
    this.ui.canvas = createCanvas(this.canvas_rect.w, this.canvas_rect.h);
    this.ui.canvas.class('game-canvas');

    this.ui.canvas.position(0, this.canvas_rect.top);

    // Create the controls panel using the controls_panel_rect coordinates
    this.ui.controls_panel = document.createElement('div');
    //add the controls panel to the quantum
    this.ui.controls_panel.classList.add('controls-panel');
    let targetContainer = document.getElementById('content-area') || document.body;
    targetContainer.appendChild(this.ui.controls_panel);

    this.ui.controls_panel.style.width = this.controls_panel_rect.w + 'px';
    this.ui.controls_panel.style.height = this.controls_panel_rect.h + 'px';
    this.ui.controls_panel.style.top = '0px';
    this.ui.controls_panel.style.left = this.viewportWidth + 'px';

    this.setupUI(); // setup the UI containers and positioning
    this.chartIsShown = false;

    this.quantumCount = 0;
    this.quanta = new Map(); // ArrayList for all "things"

    this.offsetX = 0; // Current horizontal offset
    this.offsetY = 0; // Current vertical offset
    this.lastX, this.lastY; // Last mouse positions
    this.isPanning = false;

    this.interferenceChart = null;
    this.tick = 0;
    this.dimension_add_mode = 1; //if 1, next numerical key press, add a dimension of that number, otherwise if -1, next numerical key press, remove a dimension of that number
    this.total_points_last_tick = 0;
    this.parented_out_of_dim_quanta = 0;
    this.wrong_parent_quanta = 0;

    
    // EGPTUniverse(fps, iframe_interval_seconds, withInterQuantumCollisions, withBonding, withFrames, emergentPhysics, minMBFillRate, universe_rect, wavelength_constant, lowest_dimension)
    this.universe = new EGPTUniverse(60, 1, false, false, true, 0, 0.1, this.canvas_rect, 1, 0); 
    // now set the EntropyGame's canvas_rect to the universe's canvas_rect so the two are in sync
    this.doTick = this.universe.doTick.bind(this.universe);
    
    // Bind the draw function to this instance
    window.draw = this.draw.bind(this);
    this.initialized = null;

  }

  resetCanvasAndControlsRects(viewport_width, viewport_height, screen_width, screen_height, canvas_width = null, canvas_height = null) {
    if (!canvas_width && !canvas_height) {
      canvas_width = viewport_width;
      canvas_height = viewport_height;
    }

    let canvas_rect = new Rectangle(0, 0, canvas_width, canvas_height, null, false);
    this.canvas_rect = canvas_rect;

    //the controls panel should occupy the right panel / 20% width of the screen width
    let controls_panel_width = screen_width - viewport_width;
    let controls_panel_height = screen_height;
    let controls_panel_rect = new Rectangle((screen_width - controls_panel_width), 0, controls_panel_width, controls_panel_height, null, false);
    this.controls_panel_rect = controls_panel_rect;
    this.viewportHeight = viewport_height;
    this.viewportWidth = viewport_width;
    this.screenWidth = screen_width;
    this.screenHeight = screen_height;
    return { canvas_rect, controls_panel_rect };
  }

  draw() {
    if (this.isLooping) {
      this.prerender();
      let tickData = this.doTick();
      if (tickData) {
        P5Renderer.render(tickData, this.universe.largeObjects);
      }
    }
  }



  resizeGameCanvas(newVirtualWidth, newViewportWidth,  canvas_rect) {
    // Store the current position of the canvas
    //let canvasLeft = this.ui.canvas.position().x;
    //let canvasTop = this.ui.canvas.position().y;

    let newScale = newViewportWidth / newVirtualWidth;
    let oldOffsetX = this.offsetX;
    let oldOffsetY = this.offsetY;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Resize the canvas
    //resizeCanvas(newWidth, newHeight);

    // Update the canvas_rect properties
    canvas_rect.w = newVirtualWidth;
    canvas_rect.h = newVirtualWidth;
    this.zoomPercent(newScale);
    

    // Reapply the stored position to keep the left and top the same
    //this.ui.canvas.position(canvasLeft, canvasTop);

    // Update the UI canvas size
    this.ui.canvas.style('width', newViewportWidth + 'px');
    this.ui.canvas.style('height', newViewportWidth + 'px');

    //give the canvas a border
    //this.ui.canvas.style('border', '3px solid white');
    

    // If you have any other properties or elements that depend on the canvas size, update them here
    // For example, if you need to update the controls panel position or size
    // this.ui.controls_panel.style.top = this.canvas_rect.top + 'px';
    // this.ui.controls_panel.style.left = this.canvas_rect.right + 'px';
  }

  tearDown() {
    //remove the canvas and controls panel
    this.initialized = null;
    this.universe.wavelengthConstant = 1;
    this.ui.canvas.remove();
    this.ui.controls_panel.remove();
    this._uiSetupFunctor = null;
  }

  show(qtree) {
    if (qtree.mass == 0) return false;
    stroke(255);
    noFill();
    strokeWeight(1);
    rectMode(CENTER);
    rect(qtree.rect.x, qtree.rect.y, qtree.rect.w * 2, qtree.rect.h * 2);
    // for (let p of qtree.quanta) {
    //   strokeWeight(2);
    //   quantum(p.rect.x, p.y);
    // }

    if (qtree.divided) {
      this.show(qtree.northeast);
      this.show(qtree.northwest);
      this.show(qtree.southeast);
      this.show(qtree.southwest);
    }
    rectMode(CORNER);
    return true;
  }

  addGameControlsPanel(controlsPanel) {
    this.ui.controls_panel.appendChild(controlsPanel.elt);
  }

  initInterferenceChart(wavelength, d_distance_between_slits, L_distance_slits_to_screen) {
    this.interferenceChart = new InterferenceChart(this.canvas_rect, wavelength, d_distance_between_slits, L_distance_slits_to_screen);
  }

  showHitCountReport(button) {
    if (!this.interferenceChart) {
      this.startSim();
      return;
    }
    this.stopSim();
    let chartIsShown = this.interferenceChart.isShown;
    if (!chartIsShown) {


      //toggle the text on the button
      button.html('Hide Chart');


      // We need a div that will be the modal dialog. It will overlay the canvas.
      // It will display the D3 chart. It will have a close button. It will have a title.
      // The chart will be a D3 chart and it will be in a bootstrap container.
      // It will not be modal, it will be a child of the left column of the bootstrap container where the canvas is.
      let hit_count_chart;
      if (!this.hit_count_chart) {
        hit_count_chart = createDiv('');
        let chart_elm = hit_count_chart.elt;
        chart_elm.id = 'hit_count_chart';
        hit_count_chart.class('container-fluid');
        hit_count_chart.style('position', 'absolute');
        hit_count_chart.style('top', this.canvas_rect.top * this.scale + 'px');
        hit_count_chart.style('left', this.canvas_rect.left * this.scale + 'px');
        hit_count_chart.style('width', this.canvas_rect.w * this.scale + 'px');
        hit_count_chart.style('height', this.canvas_rect.h * this.scale + 'px');
        let canvas_z_index = this.ui.canvas.style('z-index');
        hit_count_chart.style('z-index', canvas_z_index + 1);
        this.hit_count_chart = hit_count_chart;
      } else {
        hit_count_chart = this.hit_count_chart;
        hit_count_chart.show();
      }


      // loop through the large objects and, for the first one that has a collision action of COUNT, get the hit count
      // via largeobject.showCart(charDiv), which will return a div that contains the chart.

      for (let lo of this.universe.largeObjects) {
        if (lo.arr_collision_actions) {
          if (lo.arr_collision_actions.includes(CollisionActions.COUNT)) {
            let dataMap = lo.getCollisionDataByY(); // Get aggregated collision data
            hit_count_chart = this.interferenceChart.showChart(hit_count_chart, dataMap, 'area');
            break;
          }
        }
      }
    } else {
      //toggle the text on the button
      button.html('Interference Report');
      //show the canvas
      this.ui.canvas.show();
      this.startSim();
      this.interferenceChart.hideChart(this.hit_count_chart);
    }


  }


  toggleSim() {
    if (this.isLooping) {
      this.stopSim();
    } else {
      this.startSim();
    }
  }
  // Function to start the simulation
  startSim() {
    if (!this.isLooping) {
      //show the canvas and the controls panel
      this.ui.canvas.show();
      loop();

      this.isLooping = true;

    }
  }


  // Function to stop the simulation
  stopSim() {
    if (this.isLooping) {
      noLoop();
      this.isLooping = false;

    }
  }
  setupUI(uiSetupFunctor = null) {
    if (uiSetupFunctor) {
      this._uiSetupFunctor = uiSetupFunctor;
    } else {
      this._uiSetupFunctor = this.defaultUIsetup;
    }
    this._uiSetupFunctor();
  }

  defaultUIsetup() {
    // Add the controls panel to the container
    // Add a "Show / Hide" button to toggle the controls panel
    let toggleButton = createButton('Hide Controls');
    toggleButton.class('btn btn-primary btn-sm ControlsMenuButton');
    toggleButton.style('position', 'absolute');
    toggleButton.style('top', '10px');
    toggleButton.style('right', '10px');
    toggleButton.mousePressed(() => {
      // Toggle the visibility of the controls panel
      if (this.ui.controls_panel.style.display === 'none') {
        this.ui.controls_panel.style.display = 'block';
        // move the canvas to the left
        this.ui.canvas.style('left', '0px');
        toggleButton.html('Hide Controls');
      } else {
        this.ui.controls_panel.style.display = 'none';
        // move the canvas to the right so it is centered
        let canvas_left = (this.screenWidth - this.viewportWidth) / 2;
        this.ui.canvas.style('left', canvas_left + 'px');
        toggleButton.html('Show Controls');
      }
    });

    // use native JS to add elements to the correct containers so that absolute positioning works as expected
    // Append the canvas and toggle button to the content area (or body as fallback)
    let uiContainer = document.getElementById('content-area') || document.body;
    uiContainer.appendChild(this.ui.canvas.elt);
    uiContainer.appendChild(toggleButton.elt);
  }

  prerender() {
    // Handle the zoom and pan of the display canvas
    translate(this.offsetX, this.offsetY); // Move the canvas based on current offset
    scale(this.scale); // Apply the current zoom scaling
  }

  zoom(magnificationLevel) {
    // Convert the magnification level to a scale factor
    let newScale;
    //if magnificationLevel is positive, then zoom in by magnification level, otherwise zoom out by  1(abs(magnificationLevel))
    if (magnificationLevel > 0) {
      newScale = magnificationLevel;
    } else {
      newScale = 1 / (1 - magnificationLevel);
    }

    // Get the current center in canvas coordinates
    let centerXCanvas = (this.canvas_rect.w / 2 - this.offsetX) / this.scale;
    let centerYCanvas = (this.canvas_rect.h / 2 - this.offsetY) / this.scale;

    // Update the scale
    this.scale = newScale;

    // Recalculate the offsets to keep the same canvas quantum centered
    this.offsetX = this.canvas_rect.w / 2 - centerXCanvas * this.scale;
    this.offsetY = this.canvas_rect.h / 2 - centerYCanvas * this.scale;
  }

  zoomPercent(percentMagnification) {
    //apply the zoom relative to the default scale of 1, save the new scale, and recenter the view
    this.scale = percentMagnification;
    //this.centerView();
  }

  panX(percent) {
    // Calculate the amount to pan based on the current canvas width and scale
    let panX = this.canvas_rect.w * percent * this.scale;
    this.offsetX += panX;
  }

  panY(percent) {
    // Calculate the amount to pan based on the current canvas height and scale
    let panY = this.canvas_rect.h * percent * this.scale;
    this.offsetY += panY;
  }

  centerView() {
    // Center the view based on the current scale and canvas dimensions
    this.centerOn(this.canvas_rect.x, this.canvas_rect.y);
  }

  centerOn(canvasX, canvasY) {
    // Calculate the new offsets so that the canvasX, canvasY quantum is centered
    this.offsetX = this.canvas_rect.w / 2 - canvasX * this.scale;
    this.offsetY = this.canvas_rect.w / 2 - canvasY * this.scale;
  }



  setFrameRate(fps) {

    this.universe.fps = fps;
    frameRate(fps);
  }
  panWithKeys() {
    switch (keyCode) {
      // Other cases...
      case DOWN_ARROW:
        //  pan up
        this.panY(0.1);
        return;
      case UP_ARROW:
        // pan down
        this.panY(-0.1);
        return;
      case LEFT_ARROW:
        // pan right
        this.panX(-0.1);
        return;
      case RIGHT_ARROW:
        // pan left
        this.panX(0.1);
        return;

    }

    switch (keyCode) {
      case ' ':
        this.toggleSim();
        break;
      case 'i':
        //show the instructions (todo, build the instructions)
        break;
      case '+':
        //on the next numerical key press, add a dimension of that number
        this.dimension_add_mode = 1;
        break;
      case '-':
        //on the next numerical key press, remove a dimension of that number
        this.dimension_add_mode = -1;
        break;
    }
    //if the key is a number, add a dimension of that number
    if (key >= '0' && key <= '9') {
      let dimension_number = parseInt(key);
      if (this.dimension_add_mode == 1) {
        this.addDimension(dimension_number);
      } else {
        this.removeDimension(dimension_number);
      }
    }
  }

  mousePressedPanning() {
    this.lastX = mouseX;
    this.lastY = mouseY;
    //this.isPanning = !this.isPanning;
    //alert ("Panning", this.isPanning);
  }

  mouseDraggedPanning() {
    if (this.isPanning) {
      this.offsetX += mouseX - this.lastX;
      this.offsetY += mouseY - this.lastY;
      this.lastX = mouseX;
      this.lastY = mouseY;
      //alert("mouse released");
    }
  }

  mouseReleasedPanning() {
    //this.isPanning = false;
  }

  mouseWheelZooming(event) {
    // Zoom the canvas
    let zoom = 0.1;
    this.scale += event.delta * -zoom;
    // Make sure we don't zoom too far in or out
    this.scale = constrain(this.scale, 0.1, 10);
  }
}

