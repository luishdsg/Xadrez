import { PieceType } from "./piceType.model";

export interface Piece {
  type: PieceType;
  player: 'white' | 'black';
  icon?: string;
}