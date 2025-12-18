
# 02 - API Architecture: The Scouting Engine

## 1. Metadata Sourcing (Gemini 3 Flash)
The application will utilize `gemini-3-flash-preview` to handle the primary scouting logic.
- **Google Search Tool**: Must be enabled to prevent hallucinations of player stats and current clubs.
- **Output Constraint**: The AI must return a structured JSON response containing normalized rarity strings and market estimations.

## 2. Image Synthesis (Gemini 2.5 Flash Image)
The system will utilize `gemini-2.5-flash-image` for portrait generation.
- **Prompt Engineering**: Dynamic prompts including player name, club colors, and cinematic lighting.
- **Safety Fallback**: If AI generation is restricted for famous athletes, the system shall utilize the `suggestedImageUrl` retrieved during the scouting phase.
