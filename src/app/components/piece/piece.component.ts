import { Component, Input } from '@angular/core';
import { Piece } from '../../models/piece.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-piece',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent {
  @Input() piece!: Piece;
  @Input() x!: number;
  @Input() y!: number;

  constructor() { }
}
