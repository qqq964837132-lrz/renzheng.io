export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface RollResult {
  value: DiceValue;
  timestamp: number;
  interpretation?: string;
}

export enum FaceRotationX {
  One = 0,
  Two = -90, // Bottom
  Three = 0,
  Four = 0,
  Five = 90, // Top
  Six = 180,
}

export enum FaceRotationY {
  One = 0,
  Two = 0,
  Three = -90, // Right
  Four = 90, // Left
  Five = 0,
  Six = 0,
}