# 05 - Refinement: The "Real Image" Solution

## The Challenge
AI-generated images sometimes fail likeness filters for very famous players, and many sports sites block direct hotlinking.

## Our Solution: The Hybrid Pipeline
1. **Search Integration**: The scouting prompt explicitly asks the AI to identify a "direct, hotlink-friendly URL" from sources like Wikimedia Commons.
2. **SuggestedImageUrl**: This URL is stored in the card metadata.
3. **Manual Override**:
   - Users can "Swap to Official" if a valid URL was found.
   - Users can "Search Web" via a pre-filled Google Image Search link if both AI and auto-links fail.
   - Advanced Mode allows manual URL pasting or local file uploads.