import { PieceType } from "./piceType.model";

export interface Piece {
  type: PieceType;
  player: 'White' | 'Black';
  icon?: string;
}