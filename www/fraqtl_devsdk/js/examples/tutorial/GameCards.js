/* Copyright 2023-2025 by Essam Abadir */

let GAME_CARDS = [
    {
        title: 'Experiment: Wave-Particle Duality',
        imageSrc: 'images/wave_particle_duality.png',
        includeInMenu: true,
        text: 'When countless particles are just perfectly bouncing balls in gravitational boxes and you start them in the same spot (polarized and coherent) the result is that the average particle position is a wave. The individual particle positions are a "random walk" (Brownian motion).',
        id: 'setupParticleWalk',
        start: function (experiment) {
            experiment.setupParticleWalk();
        }
    },
    {
        title: "Experiment: Wave Interference Patterns",
        imageSrc: 'images/concentric_interference.png',
        includeInMenu: true,
        text: 'The theoretical benchmark for Quantum computing is computing light (Boson sampling) ... this computation running in your web might take Google\'s Willow quantum computer seven septillion years to compute :)',
        id: 'setupCornuSpiral',
        start: function (experiment) {
            experiment.setupWaveInterference();
        }
    },
    {
        title: "Experiment: Atomic Model & The Strong Force",
        imageSrc: 'images/atom_strongforce.png',
        includeInMenu: true,
        text: 'This simulation shows how the strong force is an emergent property of frames and layers (dimensions) acting as a bounding box on particle movement.',
        id: 'setupAtomicModel',
        start: function (experiment) {
            experiment.setupAtomicModel();
        }
    },
    {
        title: 'Experiment: Black Body Radiation',
        imageSrc: 'images/BlackBodyRadiation.png',
        includeInMenu: true,
        text: 'What is the relationship between temperature and the color of light emitted by a black body? By moving the temperature slider you can run the experiment yourself!',
        id: 'blackBodyRadiation',
        start: function (experiment) {
            experiment.setupBlackBody();
        }
    },
    {
        title: "Experiment: Double Slit (Wave)",
        imageSrc: 'images/greenlaser_doubleslit.png',
        includeInMenu: true,
        text: 'Wave source through double slits. Feynman said this was "impossible ... absolutely impossible!"',
        id: 'setupDoubleSlitWave',
        start: function (experiment) {
            experiment.setupDoubleSlit(false);
        }
    },
    {
        title: "Big Bang: Emergent Physics",
        imageSrc: 'images/big_bang.png',
        includeInMenu: true,
        text: 'Boom!',
        id: 'setupBigBang',
        start: function (experiment) {
            experiment.setupBigBang(true);
        }
    },
    {
        title: 'Quantum Computing with the FRAQTL Engine',
        imageSrc: 'images/EGPTFractal.png',
        includeInMenu: true,
        text: 'Physics Without Equations: If you can compute any oscillator, you can compute any quantum system ... on a classical computer.',
        id: 'setupEGPTFractal',
        start: function (experiment) {
            experiment.setupEGPTFractal();
        }
    },
    {
        title: 'Experiment: Black Body Radiation & Quantum Gravity',
        imageSrc: 'images/BlackBodyRadiation.png',
        includeInMenu: false,
        text: 'Why do collisions happen and what happens when they do? Click on the "Run" button to see the experiment in action.',
        id: 'bouncyBox',
        start: function (experiment) {
            experiment.setupBouncyBox();
        }
    },
];
