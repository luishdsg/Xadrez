import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { PieceComponent } from './components/piece/piece.component';
import { PopUpComponent } from './shared/components/pop-up/pop-up.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

registerLocaleData(localePt, 'pt');
@NgModule({
  declarations: [
  ],
  imports: [
    MatButtonModule,
    MatDialogModule,
    AppComponent,
    BoardComponent,
    SidebarComponent,
    CommonModule,
    PieceComponent,
    PopUpComponent,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' }
  ],
  schemas: [NO_ERRORS_SCHEMA]
})

export class AppModule { }