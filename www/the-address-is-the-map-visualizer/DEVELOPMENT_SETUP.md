# The Address Is The Map Visualizer - Development Setup

This guide will help you set up and run the enhanced Address Is The Map Visualizer with the new P=NP Problem Test Center.

## Quick Start

### Option 1: VS Code Launch Configuration (Recommended)
1. Open the project in VS Code
2. Go to the **Run and Debug** panel (Ctrl+Shift+D)
3. Select **"Address Is The Map Visualizer"** from the dropdown
4. Click the **Play** button or press F5

### Option 2: Command Line Script
```bash
cd web/the-address-is-the-map-visualizer
./start-dev.sh
```

### Option 3: Manual npm Commands
```bash
cd web/the-address-is-the-map-visualizer
npm install
npm run dev
```

## Development Server

Once started, the development server will be available at:
- **Local**: http://localhost:3000
- **Network**: http://0.0.0.0:3000 (accessible from other devices on your network)

## Available Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview the built project

### VS Code Tasks
Press `Ctrl+Shift+P` and type "Tasks: Run Task" to access:
- **Start Visualizer Dev Server** - Start development server
- **Build Visualizer** - Build for production
- **Preview Visualizer** - Preview built project
- **Install Visualizer Dependencies** - Install npm packages
- **Clean Visualizer** - Remove build artifacts

### Launch Configurations
Available in the Run and Debug panel:
- **Address Is The Map Visualizer** - Start development server
- **Address Is The Map Visualizer (Build)** - Build for production

## Project Structure

```
web/the-address-is-the-map-visualizer/
├── components/
│   ├── TestCenter.tsx              # Main test center container
│   ├── ProblemSpecification.tsx    # CNF problem input interface
│   ├── CircuitVisualization.tsx    # Graph coloring visualization
│   ├── SolverInterface.tsx         # Solver selection and execution
│   ├── CertificateVerifier.tsx     # Certificate validation
│   ├── IntroModal.tsx             # Enhanced intro with tabs
│   └── (other existing components)
├── examples/
│   └── problems.ts                # Pre-built example problems
├── solvers/
│   └── BruteForceSolver.ts        # Solver implementations
├── utils/
│   └── cnfUtils.ts               # CNF parsing and utilities
├── App.tsx                        # Main app with navigation
├── index.tsx                      # Entry point
├── index.html                     # HTML template
├── index.css                      # Global styles
├── vite.config.ts                 # Vite configuration
├── package.json                   # Dependencies and scripts
├── start-dev.sh                   # Convenience script
└── README_ENHANCED.md             # Enhanced features documentation
```

## Features Overview

### Enhanced Introduction
- **Multi-tab interface** explaining the "Address Is The Map" metaphor
- **Traveling Salesman Problem** explanation
- **Circuit SAT / Graph Coloring** concepts
- **Encoder/Decoder insight** showing bijective mapping

### P=NP Problem Test Center
- **Problem Specification**: Load examples, generate random problems, or input manually
- **Circuit Visualization**: Graph coloring representation of CNF problems
- **Solver Interface**: Built-in solvers (Brute Force, Random, DPLL) + custom solver support
- **Certificate Verification**: Validate solutions with complexity analysis

### EGPT Theory Integration
- Explicit connections to formal EGPT framework
- Code references to Lean theorem prover files
- Complexity bounds and bijection demonstrations

## Development Tips

### Hot Reload
The development server supports hot reload. Changes to React components will automatically refresh the browser.

### TypeScript Support
The project uses TypeScript with strict type checking. VS Code will show type errors in real-time.

### Tailwind CSS
The project uses Tailwind CSS via CDN. All styling is done through Tailwind classes.

### Browser Compatibility
The app is built with modern web standards and works best in:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
npm run dev -- --port 3001
```

### Dependencies Issues
If you encounter dependency issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Issues
If the build fails:
```bash
npm run clean
npm install
npm run build
```

### VS Code Issues
If VS Code launch configurations don't work:
1. Ensure you're in the workspace root
2. Check that the paths in `.vscode/launch.json` are correct
3. Try running the command manually first

## Production Deployment

### Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Deploy
The `dist/` folder contains the built application ready for deployment to any static hosting service.

## Contributing

1. Make changes to the React components
2. Test in development mode
3. Build and test the production version
4. The hot reload will help you see changes immediately

## Architecture Notes

### State Management
The app uses React's built-in state management with hooks. No external state management library is needed for this scope.

### Component Structure
- **Container Components**: Handle state and business logic
- **Presentation Components**: Handle UI rendering
- **Utility Functions**: Pure functions for data processing

### Performance
- Components are optimized for re-rendering
- Large datasets use virtualization where needed
- Solver execution runs in the main thread (consider Web Workers for heavy computations)

## Next Steps

After getting the development server running:

1. **Explore the Enhanced Intro**: Click through the tabs to understand the metaphors
2. **Try the Test Center**: Load example problems and run solvers
3. **Experiment with Custom Solvers**: Write your own solver implementations
4. **Understand EGPT Connections**: Follow the theory links throughout the interface

The visualizer demonstrates how the "Address Is The Map" insight leads directly to the P=NP result through bijective encoding and efficient certificate verification.
