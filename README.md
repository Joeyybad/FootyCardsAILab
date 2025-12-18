
# ⚽️ FootyCards AI Lab

A premium, AI-powered football card collection platform built using the **Spec-Driven Development** (SDD) methodology.

## 🚀 Methodology: Spec-First
This repository is organized following a strict "Specification-First" approach. Before implementing the UI or the logic, the system's behavior, data schemas, and design constraints were fully documented in the `docs/` folder.

- **Planning Phase**: Documents `01` to `05` define the core protocols.
- **Execution Phase**: Implementation of the Gemini Dual-Model pipeline.

## 🛠 Technical Stack
- **Framework**: React (ESM)
- **Intelligence**: 
  - `gemini-3-flash-preview`: Scouting & Search Grounding.
  - `gemini-2.5-flash-image`: Cinematic Portrait Synthesis.
- **Styling**: Tailwind CSS & Lucide Icons.
- **Persistence**: LocalStorage Treasury.

## 🧬 Core Features
- **Scouting Engine**: Fetch real-world stats and market values with verifiable sources (Google Search Grounding).
- **Portrait Forge**: Generate bespoke card art using high-end sports photography prompts.
- **Battle Arena**: Compare player stats with a dynamic, visual comparison engine.
- **Dual Themes**: Toggle between "Laboratory" (Dark) and "Stadium" (Light) modes.

## 📂 Project Structure
- `/docs`: Full technical specifications and design systems.
- `/services`: Gemini API interaction layers.
- `/project-manager`: Roadmaps and task tracking.
- `App.tsx`: The primary application interface.

## 🛡 License
Distributed under the MIT License.
