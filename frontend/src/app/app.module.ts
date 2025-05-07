import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { PieceComponent } from './components/piece/piece.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    declarations: [
        
    ],
    imports: [
        AppComponent, 
        BoardComponent, 
        PieceComponent,
        BrowserModule, 
        DragDropModule
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }