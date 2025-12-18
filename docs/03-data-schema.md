# 03 - Data Schema: Player Treasury

## 1. Player Metadata Object
The core data structure for a `PlayerCard` ensures consistent rendering across the collection and battle arena.

```typescript
interface PlayerCard {
  id: string; // UUID
  name: string;
  nationality: string;
  club: string;
  position: string;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  marketValue: number; // In Euro
  imageUrl: string; // Base64 or Hotlink
  suggestedImageUrl?: string;
  description: string;
  timestamp: number;
  groundingSources?: Array<{ title: string; uri: string }>;
}
```

## 2. Rarity Distribution Logic
Rarity is determined by the AI based on the player's real-world prestige:
- **Common**: Rotational or lower-tier professional players.
- **Rare**: Established starters in top leagues.
- **Epic**: International superstars and elite performers.
- **Legendary**: Ballon d'Or winners, legends of the game, or generational talents.
