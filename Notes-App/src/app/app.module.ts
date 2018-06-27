import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { NoteTakerComponent } from './note-taker/note-taker.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import { CustomDateAdapter } from './custom-date-adaptor';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';


import { NoteGroupComponent } from './note-group/note-group.component';
import { NoteViewComponent } from './note-view/note-view.component';
import { NoteComponent } from './note/note.component';
import { HomeComponent } from './home/home.component';
import { NotesService } from './services/notes.service';
import { GroupsService } from './services/groups.service';
import { AuthGuardService } from './services/auth-guard.service';
import { SocketIoService } from './services/socket-io.service';
import { DataService } from './services/data.service';

import { ConfirmDeleteNoteDialogComponent } from './confirm-delete-note-dialog/confirm-delete-note-dialog.component';
import { CreateGroupDialogComponent } from './create-group-dialog/create-group-dialog.component';
import { ConfirmDeleteGroupDialogComponent } from './confirm-delete-group-dialog/confirm-delete-group-dialog.component';
import { AddNoteToGroupDialogComponent } from './add-note-to-group-dialog/add-note-to-group-dialog.component';
import { EditNoteDialogComponent } from './edit-note-dialog/edit-note-dialog.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { ShareNoteDialogComponent } from './share-note-dialog/share-note-dialog.component';
import { AddRemainderComponent } from './add-remainder/add-remainder.component';
import { ToastNotificationComponent } from './toast-notification/toast-notification.component';

//Adding home and default route paths
const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: '', component: LoginSignupComponent }
];

//Date format which will be used for showing remainder date and time
const APP_DATE_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NoteTakerComponent,
    NoteGroupComponent,
    NoteViewComponent,
    NoteComponent,
    HomeComponent,
    ConfirmDeleteNoteDialogComponent,
    CreateGroupDialogComponent,
    ConfirmDeleteGroupDialogComponent,
    AddNoteToGroupDialogComponent,
    EditNoteDialogComponent,
    LoginSignupComponent,
    ShareNoteDialogComponent,
    AddRemainderComponent,
    ToastNotificationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatTabsModule,
    MatMenuModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule.forRoot(routes)
  ],
  providers: [AuthGuardService, NotesService, GroupsService, SocketIoService, DataService,
    {
      provide: DateAdapter, useClass: CustomDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDeleteNoteDialogComponent, CreateGroupDialogComponent, ConfirmDeleteGroupDialogComponent, AddNoteToGroupDialogComponent, EditNoteDialogComponent, ShareNoteDialogComponent, AddRemainderComponent]
})
export class AppModule { }
