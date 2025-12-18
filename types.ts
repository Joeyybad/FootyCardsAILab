
export enum PlayerRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PlayerCard {
  id: string;
  name: string;
  nationality: string;
  club: string;
  position: string;
  stats: PlayerStats;
  rarity: PlayerRarity;
  marketValue: number;
  imageUrl: string;
  suggestedImageUrl?: string;
  description: string;
  timestamp: number;
  groundingSources?: GroundingSource[];
}
