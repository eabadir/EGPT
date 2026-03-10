/* Copyright 2023-2025 by Essam Abadir */

class GameControls {
  constructor(entropyGame) {
    resetScale(1)
    this.entropyGame = entropyGame;
    this.canvasImages = [];

    this.controls = [];
    this.tickfunctions = [];
    let tickfunction = () => {
      //loop through the controls and can call the tick function on each one
      for (let functor of this.tickfunctions) {
        functor()
      }
    }
    this.mousePressedHandlers = []; // Array to store mousePressed handlers
    // Bind the mousePressed event to call all handlers in the array
    this.entropyGame.ui.canvas.mousePressed(() => {
      this.mousePressedHandlers.forEach(handler => handler());
    });
    this.entropyGame.universe.experimentTickFunctions.push(tickfunction);
    this._cardBody = null;
    this.gameControls = null;
    this.setUpGameControls();
    //this.setupEnableLoggingCheckbox();
    this.entropyGame.addGameControlsPanel(this.gameControls);

  }

  setUpGameControls() {
    resetScale(1)
    // Create the controls panel card
    let controlsPanel = select('#GameControls');
    if (!controlsPanel) {
      controlsPanel = createDiv('').id('GameControls').class('GameControls');
    } else {
      controlsPanel.elt.innerHTML = '';
    }
    let card = createDiv('').class('card controls-card'); // Ensure controls-card class is applied

    // Create the sections of the controls panel card using Bootstrap 5.3
    let card_header = createDiv('').class('card-header');
    card_header.style('width', '100%');
    let header_elements = createDiv('').class('d-flex justify-content-between');
    let header_title = createDiv('').class('h5');
    header_title.html('Entropy Game Controls');
    header_elements.child(header_title);
    card_header.child(header_elements);

    let cardbody = createDiv('').class('card-body controls-card-body');
    cardbody.style('width', '100%');

    let card_footer = createDiv('').class('card-footer');
    card_footer.style('width', '100%');
    card_footer.html('Copyright Essam Abadir, 2023');

    // Add the sections to the controls panel card
    card.child(card_header);
    card.child(cardbody);
    card.child(card_footer);

    // Add the controls panel card to the controls panel
    controlsPanel.child(card);
    this._cardBody = cardbody;
    this.gameControls = controlsPanel;
  }
  addControlsToCard(controls) {
    controls.elt.classList.add('controls-group');
    // loop through the controls and check whether they buttons, labels, or sliders that we can style with Bootstrap 5.3
    //loop through them as P5 elements so we can style sliders as well

    this._cardBody.child(controls);
  }

  setupNavButtons(backfunction, restartfunction) {
    let backControl = createButton('Back');
    //apply bootstrap danger button class to Back
    backControl.class('btn btn-danger');

    backControl.mousePressed(() => {
      this.entropyGame.tearDown();
      backfunction();
    });

    let restartControl = createButton('Restart');
    restartControl.mousePressed(() => {
      this.entropyGame.tearDown();  // Tear down the current game
      restartfunction(); // Restart the game
    });
    restartControl.class('btn btn-light');

    let control_group = [];
    control_group.push([this.getStopStartButton(), this.getResetViewButton(), restartControl,backControl ]);
    //control_group.child(nextControl);
    control_group = this.makeControlsGroup(control_group);
    this.addControlsToCard(control_group);
  }

  setupDimensionList() {
    // Lists the dimensions in the universe, and allows the user to add or remove dimensions using a text input field
    let control_title = createP('Dimensions: ');

    //create a dropdown list of dimensions we can add or remove from when the user enters a number and clicks the add or remove button
    //create a dropdown list of dimensions by getting the universe's dimensions
    let dimensions = this.entropyGame.universe.dimensions;
    let dimension_list = createSelect();
    for (let dimension of dimensions) {
      dimension_list.option(dimension.level);
    }
    let number_input = createInput('');
    let add_button = createButton('Add');
    let remove_button = createButton('Remove');

    add_button.mousePressed(() => {
      let dimension_level = parseInt(number_input.value());
      this.entropyGame.universe.addDimension(dimension_level);
      dimension_list.option(dimension_level);
    });

    remove_button.mousePressed(() => {
      let dimension_level = parseInt(number_input.value());
      this.entropyGame.universe.removeDimension(dimension_level);
      dimension_list.remove(dimension_level);
    });

    let controls = [[control_title, dimension_list], [number_input, add_button, remove_button]];
    let control_group = this.makeControlsGroup(controls);
    this.addControlsToCard(control_group);
  }

  setupViewportClickHandler() {
    this.mousePressedHandlers.push(() => {
      // Get mouse coordinates relative to the viewport
      let mouseXViewport = mouseX;
      let mouseYViewport = mouseY;

      // Translate the viewport coordinates to the underlying canvas coordinates
      let canvasX = (mouseXViewport - this.entropyGame.offsetX) / this.entropyGame.scale;
      let canvasY = (mouseYViewport - this.entropyGame.offsetY) / this.entropyGame.scale;

      // Update the viewport's center to the clicked canvas coordinates
      this.entropyGame.centerOn(canvasX, canvasY);
    });
  }


  setupZoomSlider() {
    
    let slider = createSlider(-15, 15, 1);
    let zoom_value_label = createP(`Click Screen to Focus Zoom: ${slider.value()}`);
    let instruction_label = createP('Click on screen to focus zoom');
    let zoom_in_button = createButton('+');
    let zoom_out_button = createButton('-');
    let pan_value_label = createP('Pan:');
    let pan_left_button = createButton('<-');
    let pan_right_button = createButton('->');
    let pan_up_button = createButton('^');
    let pan_down_button = createButton('v');

    slider.input(() => {
      let zoom_value = slider.value();
      zoom_value_label.html(`Current zoom: ${zoom_value}`);
      this.entropyGame.zoom(zoom_value);
    });

    zoom_in_button.mousePressed(() => {
      let zoom_value = slider.value() + 1;
      slider.value(zoom_value);
      zoom_value_label.html(`Zoom: ${zoom_value}`);
      this.entropyGame.zoom(zoom_value);
    });

    zoom_out_button.mousePressed(() => {
      let zoom_value = slider.value() - 1;
      slider.value(zoom_value);
      zoom_value_label.html(`Current zoom: ${zoom_value}`);
      this.entropyGame.zoom(zoom_value);
    });

    pan_left_button.mousePressed(() => {
      this.entropyGame.panX(.05);
    });

    pan_right_button.mousePressed(() => {
      this.entropyGame.panX(-.05);
    });

    pan_up_button.mousePressed(() => {
      this.entropyGame.panY(.05);
    });

    pan_down_button.mousePressed(() => {
      this.entropyGame.panY(-.05);
    });

    let resetcontrol = this.getResetViewButton();

    let control_group = []
    
    control_group.push([zoom_value_label, zoom_in_button, zoom_out_button, slider]);
    //control_group.push(control);
    //control_group.push(instruction_label);
    control_group.push([pan_value_label, pan_left_button, pan_right_button, pan_up_button, pan_down_button,resetcontrol]);

    let styledControls = this.makeControlsGroup(control_group);

    this.addControlsToCard(styledControls);
  }

    makeControlsGroup(controls) {
      let returnControl = null;
      let listGroup = null;
      if (controls.length > 1) {
          listGroup = createDiv('').class('list-group');
      }
  
      for (let i = 0; i < controls.length; i++) {
          let control = controls[i];
          let controls_row = null;
          if (Array.isArray(control)) {
              controls_row = createDiv('');
              for (let subcontrol of control) {
                  this.styleControlElement(subcontrol);
                  controls_row.child(subcontrol);
              }
          } else {
              controls_row = this.styleControlElement(control);
          }
  
          if (listGroup) {
              let listItem = createDiv('').class('list-group-item');
              listItem.child(controls_row);
              listGroup.child(listItem);
          } else {
              returnControl = controls_row;
              return returnControl;
          }
      }
      return listGroup;
  }

  styleControlElement(control) {
    let controlElt = control.elt;
    if (!controlElt) {
      controlElt = control;
    }


    let fontsize = 'fs-4';
    let padding = 'p-3'; // Added padding class

    if (controlElt.tagName === 'BUTTON') {
      controlElt.classList.add('btn', 'btn-primary', 'btn-md', 'controls-button'); // Added padding
    } else if (controlElt.tagName === 'P') {
      controlElt.classList.add('card-text'); // Added padding
    } else if (controlElt.tagName === 'INPUT') {
      controlElt.classList.add('form-range'); // Added padding
    } else if (controlElt.tagName === 'DIV') {
      controlElt.classList.add('controls-group'); // Added padding
      //recursively style the controls in the div
      for (let subcontrol of controlElt.childNodes) {
        this.styleControlElement(subcontrol);
      }
    }
    return control;
  }

  setupEnableLoggingCheckbox() {
    let control = createCheckbox('Enable Logging');
    control.checked(false);
    this.controls.push(control);
    this.tickfunctions.push(() => {
      this.entropyGame.universe.enableLogging = control.checked();
    });
    this.addControlsToCard(control);
  }

  setupScreenCapButton() {
    let control = createButton('Screen Capture');
    control.mousePressed(() => {
      this.captureMode = true; // Enable capture mode
    });

    // Create a slider control for the square side pixel width
    this.slider = createSlider(100, 1000, 200);
    this.slider.input(() => {
      this.captureMode = false; // Disable capture mode when the slider is adjusted
    });

    // Add a mousePressed event to the canvas
    this.entropyGame.ui.canvas.mousePressed(() => {
      if (this.captureMode) {
        this.captureCanvas(mouseX, mouseY);
      }
    });
  }

  setupWavelengthSlider(options = null) {
    const isCustom = options && typeof options === 'object';
    const min = isCustom && options.min !== undefined ? options.min : 1;
    const max = isCustom && options.max !== undefined ? options.max : 128;
    const step = isCustom && options.step !== undefined ? options.step : 1;
    const initialValue = isCustom && options.initialValue !== undefined ? options.initialValue : 1;
    const label = isCustom && options.label ? options.label : 'Wavelength Multiplier';

    let control_title = createP(label + ': ' + initialValue);
    let control = createSlider(min, max, initialValue, step);

    const applyValue = () => {
      const value = control.value();
      if (isCustom) {
        this.entropyGame.universe.wavelengthConstant = value;
        control_title.html('Wavelength Multiplier: ' + this.entropyGame.universe.wavelengthConstant);
      } else {
        //PLANCKS_CONSTANT = value;
        //
        control_title.html('Wavelength Multiplier: ' + this.entropyGame.universe.wavelengthConstant);
      }
    };

    control.input(() => {
      applyValue();
    });

    // Initialize label from current state
    applyValue();

    let controls = [[control_title, control]];
    let control_group = this.makeControlsGroup(controls);

    this.addControlsToCard(control_group);
  }

  setupFramerateSlider() {
    let control_title = createP('framerate: ');
    let control = createSlider(1, 60, 30);
    control.input(() => {
      this.entropyGame.universe.fps = control.value();
      frameRate(this.entropyGame.universe.fps);
    });
    let tickfunction = () => {
      this.entropyGame.universe.fps = control.value();
      //Visualization Code - show the frametree and the framerate. Has no effect on the simulation
      let fr = floor(frameRate());
      control_title.html('Framerate: ' + fr);
    }
    let controls = [[control_title, control]];
    let control_group = this.makeControlsGroup(controls);
    this.addControlsToCard(control_group);
  }

 
  setupTempSlider(oven, initial_slider_value, label = 'Temperature') {
    const sliderMax = 10000;
    const sliderMin = 100; // Normalized display range from 1 to 100
    let sliderIncrement = 100; // Slider increments by 1
    let controlLabel = label;
    let initialValue = Math.max(sliderMin, Math.min(sliderMax, initial_slider_value));
    
    let control_title = createP(
      controlLabel + ": " + (initialValue ) 
    );
    let control = createSlider(sliderMin, sliderMax, initialValue, sliderIncrement);

    oven.setTemperature(initialValue);

    control.input(() => {
      let control_value = control.value();
      oven.setTemperature(control_value);
      control_title.html(
        controlLabel +  ': ' + (control_value)
      );
    });

    this.tickfunctions.push(() => { });
    let control_group = [control_title, control];
    control_group = this.makeControlsGroup(control_group);
    this.addControlsToCard(control_group);
  }



  setupAutoFireCheckbox(quantum_emitter) {
    let control = createCheckbox('Auto Fire Quanta', quantum_emitter.auto_fire);
    control.changed(() => {
      quantum_emitter.auto_fire = !quantum_emitter.auto_fire;
      if (quantum_emitter.auto_fire) {
        control.elt.childNodes[1].nodeValue = 'Stop Auto Firing';
      } else {
        control.elt.childNodes[1].nodeValue = 'Auto Fire Quanta';
      }
    });
    control = this.styleControlElement(control);

    this.addControlsToCard(control);
  }

  getStopStartButton() {
    let control = createButton(this.entropyGame.isLooping ? 'Pause' : 'Play');
    if (this.entropyGame.isLooping) {
      control.class('btn btn-secondary');
    } else {
      control.class('btn btn-success');
    }
    control.mousePressed(() => {
      this.entropyGame.toggleSim();
      if (this.entropyGame.isLooping) {
        control.html('Pause');
        control.class('btn btn-secondary');
      } else {
        control.html('Play');
        control.class('btn btn-success');
      }
    });
    control = this.styleControlElement(control);

    return control;
  }



  setupInterferenceReportButton() {
    let control = createButton('Interference Report');
    control.mousePressed(() => {

      this.entropyGame.showHitCountReport(control);
    });
    control = this.styleControlElement(control);
    this.addControlsToCard(control);
  }

  getResetViewButton() {
    let control = createButton('Reset View');
    
    control.class('btn btn-info');
    control.mousePressed(() => {
      this.entropyGame.scale = this.entropyGame.default_scale;
      this.entropyGame.offsetX = 0;
      this.entropyGame.offsetY = 0;
    });
    control = this.styleControlElement(control);
    return control;
  }

  setupAll() {
    this.setupZoomSlider();
    this.setupFramerateSlider();

    this.setupFrameTreeCheckbox();
    this.setupBondingCheckbox();
    this.setupInterQuantumCollisionsCheckbox();
    this.setupShowTreeCheckbox();
    this.setupQuantumCountSlider();
    this.setupQuantumEmitter();
    this.setupAutoFireCheckbox();
    this.setupInterferenceReportButton();
   

  }

}
