# CLAUDE.md - StemVanVandaag Project Guidelines

## Project Overview
A simple GeoJSON map viewer web application built with Svelte, TypeScript, Vite, and Leaflet.js for visualization.

## Commands
- **Install dependencies**: `npm install`
- **Run locally**: `npm run dev` (starts dev server at http://localhost:5173)
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Type-check**: `npm run check`

## Project Structure
- `/public/` - Static assets including the default gemeentekaart.geojson file
- `/src/` - Source code
  - `/lib/` - Reusable Svelte components
    - `Map.svelte` - Leaflet map component
  - `App.svelte` - Main application component
  - `main.ts` - Entry point
  - `app.css` - Global styles

## Code Style Guidelines
- **Svelte**: 
  - Use TypeScript for type-safety
  - Keep components focused on a single responsibility
  - Use reactive statements with `$:` for derived state
  - Leverage Svelte's built-in reactivity
- **CSS**: 
  - Scope styles within components
  - Group related properties
  - Use classes for reusable styles
  - Prefer rem/em over px
- **TypeScript**: 
  - Define interfaces for data structures
  - Use camelCase for variables and functions
  - Add descriptive comments for complex logic
  - Handle errors with try/catch blocks
  - Prefer arrow functions for callbacks
  - Use descriptive variable/function names

## Naming Conventions
- **Components**: Use PascalCase (e.g., `Map.svelte`, `ControlPanel.svelte`)
- **IDs/Classes**: Use kebab-case (e.g., `file-drop`, `control-panel`)
- **Functions**: Use descriptive verbs (e.g., `updateStatus`, `handleFile`)
- **Variables**: Use descriptive nouns (e.g., `geoJSONData`, `geoJSONLayer`)
- **Props**: Use camelCase for component props

## Best Practices
- Use Svelte's reactive declarations for derived state
- Keep components small and focused on a single responsibility
- Use TypeScript for type safety
- Validate user input/data before processing
- Use Vite for fast development and optimized builds
- Implement proper error handling
- Maintain a clean UI with intuitive controls

## GeoJSON Integration
- Store GeoJSON files in the `/public` directory
- Use Vite's `?url` import suffix to load GeoJSON files
- Configure Vite to treat GeoJSON files as assets with `assetsInclude: ['**/*.geojson']`
- Handle GeoJSON validation before processing
- Implement proper error handling for GeoJSON loading
- Map appearance is configured with fixed values (color, opacity, spacing)
- The application has been simplified to focus solely on map visualization