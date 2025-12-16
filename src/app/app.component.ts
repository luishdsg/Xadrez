import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BoardComponent,
    DragDropModule,
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
