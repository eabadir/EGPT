/* Copyright 2023-2025 by Essam Abadir */

class Experiments {
    constructor(simulationId) {
        this.simulationId = simulationId;
        this.entropyGame = null;
        this.universe = null;
        this.gameControls = null;
        this.init();

    }

    init() {
        this.entropyGame = new EntropyGame(window.innerHeight, window.innerHeight);
        this.universe = this.entropyGame.universe;
        this.gameControls = new GameControls(this.entropyGame);
        this.startExperimentFromGameCard(this.simulationId);
        this.gameControls.setupNavButtons(setup, this.restartSimulation.bind(this));
        this.gameControls.setupViewportClickHandler();
        this.gameControls.setupZoomSlider();
    }

    restartSimulation() {
        this.entropyGame.stopSim();
        this.universe = null;
        this.entropyGame.tearDown();
        this.init();
    }


    setupEGPTFractal() {
        const context = this.entropyGame;
        createOscillatorSetup(context);
        this.entropyGame.startSim();
    }

    setupDoubleSlit(useGreenLaser = false) {
        //resetScale(2);
        //this.gameControls.setupWavelengthSlider(entropyGame.universe);
        this.universe.wavelengthConstant = 1;

        let detect_at_slits = 1, absorb_at_slit_wall = true, use_quantum_dimension = false, quantum_charge = null, quantumlimit = Infinity, angle_increment = 10, emergent_physics = false, laser_color = null, use_gun = false, autofire = false;

        if (useGreenLaser) {
            laser_color = [0, 255, 0];
            use_gun = false;
        }

        let fundamental_dimension_number = 2;
        let quantum_dimension_number = 3

        let canvas_rect = this.entropyGame.canvas_rect;
        let wavelength = 64;

        let quantum_dimension = null;
        this.universe.emergentPhysics = emergent_physics;
        if (use_quantum_dimension) {
            quantum_dimension = this.universe.addDimension(quantum_dimension_number);
        }
        //  init(universe_rect, fundamental_dimension_number, wavelengthConstant = 1, isGreedy = false, noEscape = false, emergentDimensions = false, noObserverFrame = false, withWrapping = false)
        let  wavelengthConstant = Math.floor(wavelength / 16), isGreedy = false, noEscape = false, emergentDimensions = false, noObserverFrame = true, withWrapping = false
        this.universe.init(this.entropyGame.canvas_rect,fundamental_dimension_number,wavelengthConstant, isGreedy,noEscape, emergentDimensions, noObserverFrame, withWrapping);
        
        
        /* ---- SLIT SCREEN ---- */
        //create a slit screen with two slits - it will compute appropriate slit separations etc. on the order of the wavelength
        let slitScreenLeft = wavelength * 1.5, slitScreenWidth = wavelength * .4;
        let slitScreen = new SlitScreen(this.entropyGame, slitScreenLeft, wavelength, canvas_rect.h, wavelength, absorb_at_slit_wall, detect_at_slits);
        
        
        /* ---- START WALL of laser ---- */
        let start_wall = new LargeObject(this.entropyGame, [120, 120, 120], new Rectangle(0, 0, 10, canvas_rect.h, null, false), CollisionTypes.ABSORB, [CollisionActions.RECOLOR, CollisionActions.KILL], "start_wall");
        
        let use_point_source = true;
        let slitLightSource = new SlitLightSource(this.entropyGame, slitScreen, angle_increment, use_point_source, laser_color, fundamental_dimension_number);
        this.quantum_emitter = slitLightSource.lightSource;

        /* ---- DETECTOR WALL - for particle counting---- */
        let detectorWall = new DetectorWall(this.entropyGame, canvas_rect);
        let dector_x_mult = 3;
        detectorWall.x = slitScreen.wall1.rect.right + dector_x_mult * wavelength;

        //this.gameControls.setupTempSlider( this.quantum_emitter.temperatureDial, 1000);

        detectorWall.addToUniverse()
        start_wall.addToUniverse();
        slitScreen.addToUniverse();


        let d_distance_between_slits = slitScreen.slit_wall_gap_height;
        let L_distance_slits_to_screen = detectorWall.x - slitScreen.wall1.rect.right;
        this.entropyGame.initInterferenceChart(1, d_distance_between_slits, L_distance_slits_to_screen);


        let tick_function = slitLightSource.getTickFunction();

        this.universe.experimentTickFunctions.push(tick_function);
        this.entropyGame.startSim();
        this.gameControls.setupAutoFireCheckbox(this.quantum_emitter);
        //this.gameControls.setupInterParticleCollisionsCheckbox();
        this.gameControls.setupInterferenceReportButton();

    }

    setupBouncyBox() {
        let quantum_dimension_number = 4;
        let fundamental_dimension_number = quantum_dimension_number - 3;
        let initial_temperature = 300;
        let wallColor = [120, 120, 120], wallThickness = 10, slitHeight = 40, wallCollisionType = CollisionTypes.BOUNCE, wallCollisionActions = [CollisionActions.RECOLOR, CollisionActions.BOUNCE], num_bouncing_balls = 1;
        let screenCenterX = Math.round(this.entropyGame.canvas_rect.w / 2);
        let screenCenterY = Math.round(this.entropyGame.canvas_rect.h / 2);
        let boxRect = new Rectangle(screenCenterX, screenCenterY, this.entropyGame.canvas_rect.w / 4, this.entropyGame.canvas_rect.h / 4, null, true);
        let bouncyBox = new BouncyBox(this.entropyGame, boxRect, wallColor, wallThickness, slitHeight, wallCollisionType, wallCollisionActions, num_bouncing_balls, fundamental_dimension_number, quantum_dimension_number);

        this.gameControls.setupFramerateSlider(this.entropyGame);
        this.gameControls.setupTempSlider(bouncyBox.temperatureDial, initial_temperature);

        this.entropyGame.zoom(2);
        this.entropyGame.startSim();
        this.entropyGame.centerOn(bouncyBox.rect.x, bouncyBox.rect.y);
    }

    setupBlackBody() {
        resetScale(1);
        const context = this.entropyGame;
        const { bouncyBox } = createBlackbodySetup(context, { temperature: 300 });

        this.entropyGame.startSim();
        this.gameControls.setupTempSlider(bouncyBox.temperatureDial, 300);
        this.entropyGame.centerOn(bouncyBox.rect.x, bouncyBox.rect.y);
    }

    setupParticleWalk() {
        // Use shared factory
        const context = this.entropyGame;
        const particleWalkSetup = createParticleWalkSetup(context, {
            fundamentalDimension: 0,
            fundamentalWaveLength: 64,
            velocity: 1
        });
        const { quantum_emitter } = particleWalkSetup;

        this.quantum_emitter = quantum_emitter;
        this.entropyGame.startSim();

        this.gameControls.setupAutoFireCheckbox(this.quantum_emitter);
        this.gameControls.setupWavelengthSlider({
            label: 'Wavelength Multiplier',
            min: 4,
            max: 256,
            step: 4,
            initialValue: this.entropyGame.universe.wavelengthConstant,
            //onChange: (nextWaveLength) => particleWalkSetup.applyFundamentalWaveLength(nextWaveLength)
        });
    }


    setupWaveInterference() {
        
        const context = this.entropyGame;
        const waveInterferenceSetup = createWaveInterferenceSetup(context, {
            fundamentalDimension: 2,
            fundamentalWaveLength: 64,
            velocity: 50000
        });
        const { pointSource1, pointSource2 } = waveInterferenceSetup;

        this.pointSource1 = pointSource1;
        this.pointSource2 = pointSource2;

        this.entropyGame.startSim();
        this.gameControls.setupWavelengthSlider({
            label: 'Fundamental WaveLength',
            min: 4,
            max: 64,
            step: 4,
            initialValue: waveInterferenceSetup.fundamentalWaveLength,
            //onChange: (nextWaveLength) => waveInterferenceSetup.applyFundamentalWaveLength(nextWaveLength)
            onChange: (nextWaveLength) => this.entropyGame.universe.wavelengthConstant = nextWaveLength
        });
        this.entropyGame.zoom(2);
        return this.pointSource1;
    }

    setupBigBang(emergent_physics = true) {
        this.universe.emergentPhysics = emergent_physics;

        let light_source_center_y = Math.floor(this.entropyGame.canvas_rect.h / 2);
        let light_source_center_x = Math.floor(this.entropyGame.canvas_rect.w / 2);
        this.universe.iframe_interval_seconds = 1 / 60;
        //color = [31, 47, 255]
        let color = null, lightSourceDiameter = 64, charge = null, wrap = false, autofire = true, quantumDimension = 0, dispersionAngleIncrement = 5, velocity = 0, quantumLimit = Infinity;
        let wavelengthConstant = 1, isGreedy = false, noEscape = false, noObserverFrame = false, withWrapping = false;

        this.universe.init(this.entropyGame.canvas_rect, quantumDimension, wavelengthConstant, isGreedy, noEscape, true, noObserverFrame, withWrapping);

        this.bigbang_source = new PointSource(this.entropyGame, color, light_source_center_x, light_source_center_y, lightSourceDiameter, velocity, lightSourceDiameter, charge, wrap, autofire, this.entropyGame.canvas_rect, 0, quantumLimit, dispersionAngleIncrement, quantumDimension, emergent_physics);
        //create a tick function that turns off autofire after n ticks
        this.current_tick = 0;
        let tick_function = function () {
            this.current_tick++;
            if (this.current_tick >= 20 * 60) {
                this.bigbang_source.quantum_limit = 0;
            }
        }

        let experiment_tick = this.bigbang_source.getDefaultTickFunction(2);

        this.universe.experimentTickFunctions.push(experiment_tick);
        //this.universe.experimentTickFunctions.push(tick_function.bind(this));
        this.entropyGame.startSim();
        this.gameControls.setupAutoFireCheckbox(this.bigbang_source);
    }

    setupAtomicModel() {
        const context = this.entropyGame;
        createAtomicModelSetup(context);
        this.entropyGame.startSim();
        this.entropyGame.zoom(4);
        this.entropyGame.centerOn(context.canvas_rect.w / 2, context.canvas_rect.h / 2);
    }

    getGameCard(experimentId) {
        for (let i = 0; i < GAME_CARDS.length; i++) {
            if (GAME_CARDS[i].id == experimentId) {
                return GAME_CARDS[i];
            }
        }
        return null;
    }

    startExperimentFromGameCard(experimentId) {
        let gameCard = this.getGameCard(experimentId);
        if (gameCard) {
            gameCard.start(this);
        }

    }
}