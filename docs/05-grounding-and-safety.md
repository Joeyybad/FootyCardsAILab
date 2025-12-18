# 05 - Implementation Policy: Grounding & Fallbacks

## 1. Grounding Compliance
Per the "Search Grounding" directive, all generated cards must display their sources.
- **Visuals**: Grounding sources shall be rendered as clickable badges in the card detail view.
- **Accuracy**: If search grounding fails to find a player, the system must return a specific "Scouting Error."

## 2. Image Safety & Likeness
Given the nature of AI-generated portraits:
- **Tier 1 (AI)**: Primary attempt at an artistic portrait.
- **Tier 2 (Official)**: If Tier 1 fails or if the user requests it, the system shall swap to the URL discovered during the scouting phase.
- **Normalization**: All rarity strings from the AI must be normalized to Title Case (e.g., "LEGENDARY" -> "Legendary") before rendering to ensure filter consistency.