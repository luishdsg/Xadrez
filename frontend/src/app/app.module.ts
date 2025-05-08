import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { PieceComponent } from './components/piece/piece.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { PopUpComponent } from './shared/pop-up/pop-up.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        
    ],
    imports: [
        MatButtonModule,
        MatDialogModule,
        AppComponent, 
        BoardComponent, 
        PieceComponent,
        PopUpComponent,
        BrowserAnimationsModule,
        BrowserModule, 
        DragDropModule
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }