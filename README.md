# Three.js Boiler

A modern React + Vite + Tailwind CSS boilerplate with Three.js, React Three Fiber, and Drei for 3D web development.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React with modern features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🚀 **Three.js** - 3D graphics library
- 🎮 **React Three Fiber** - React renderer for Three.js
- 🛠️ **Drei** - Useful helpers for React Three Fiber

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── App.jsx          # Main App component with 3D scene
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 3D Scene Features

The boilerplate includes a basic 3D scene with:

- **Interactive Cube** - Orange cube that you can orbit around
- **Lighting** - Ambient and directional lighting
- **Orbit Controls** - Mouse/touch controls for camera movement
- **Responsive Design** - Scene adapts to different screen sizes

## Three.js Packages Installed

- **three** - Core Three.js library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and abstractions

## Development Guidelines

- Use functional components with hooks
- Follow the coding style in the existing files
- Use Tailwind CSS for styling
- Keep components small and focused
- Use descriptive variable names
- Leverage Drei helpers for common 3D operations

## Next Steps

1. **Add More 3D Objects** - Import models, create geometries
2. **Add Animations** - Use React Three Fiber's animation system
3. **Add Interactions** - Click handlers, hover effects
4. **Add Physics** - Install `@react-three/cannon` for physics
5. **Add Post-processing** - Install `@react-three/postprocessing`

## License

ISC 