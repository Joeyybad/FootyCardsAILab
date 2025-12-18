
# 02 - API Integration: The Scouting Engine

## Player Metadata (Gemini 3 Flash)
We use `gemini-3-flash-preview` with **Google Search Grounding** to ensure stats are not hallucinated.
- **Input**: User search query (e.g., "Zinedine Zidane").
- **Output**: JSON object containing stats, club, nationality, market value, and a "Suggested Image URL" found during the search.
- **Grounding**: We extract `groundingChunks` to provide users with clickable verification links.

## Generative Portraits (Gemini 2.5 Flash Image)
We use `gemini-2.5-flash-image` to create a "Panini Sticker" aesthetic.
- **Prompting Strategy**: We inject player name and club into a curated prompt to ensure the kit colors and likeness are respected.
- **Safety Handling**: If a famous likeness is restricted by filters, the app automatically falls back to the `suggestedImageUrl` found during scouting.
