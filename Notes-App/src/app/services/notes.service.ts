import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Note } from '../templates/note';
import { tap } from 'rxjs/operators';
import { User } from '../templates/user';
import { SocketIoService } from './socket-io.service';


@Injectable({
  providedIn: 'root'
})
export class NotesService {
  notes: Array<Note>;
  user: User;
  selectedNotes: Array<Note>;
  notesSubject: BehaviorSubject<Array<Note>>;
  selectedNotesSubject: BehaviorSubject<Array<Note>>;
  searchText: string;
  searchTextSubject: BehaviorSubject<string>;
  bearerToken: string;
  private url = 'http://localhost:3000/api/v1/notes';

  constructor(private http: HttpClient, private socketIo: SocketIoService) {
    this.notes = [];
    this.notesSubject = new BehaviorSubject(this.notes);
    this.selectedNotes = [];
    this.selectedNotesSubject = new BehaviorSubject(this.selectedNotes);
    this.searchText = '';
    this.searchTextSubject = new BehaviorSubject(this.searchText);
  }

  //Add a new note
  addNote(note, groupId?): Observable<Note> {
    let payload;
    if (groupId) {
      payload = { userid: this.user.userId, groupid: groupId, title: note.title, content: note.content };
    }
    else {
      payload = { userid: this.user.userId, title: note.title, content: note.content };
    }
    return this.http.post<Note>(`${this.url}/create`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateNotes()
    }
    ));
  }

  //Get all notes created by the user
  getNotes(): Observable<Array<Note>> {
    return this.notesSubject;
  }

  //Update notesSubject with all the notes created by the user
  updateNotes(token?, user?) {
    if (token)
      this.bearerToken = token;
    if (user)
      this.user = user;
    if (this.user.userId && this.bearerToken) {
      const payload = { userid: this.user.userId };
      return this.http.post<Array<Note>>(`${this.url}`, payload, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.bearerToken}`)
      }).subscribe(notes => {
        this.notes = notes;
        this.notesSubject.next(this.notes);
      })
    }
  }

  //Toggle favorite status of a note
  toggleFavorite(noteId): Observable<Note> {
    const payload = { userid: this.user.userId, noteid: noteId };
    return this.http.put<Note>(`${this.url}/fav`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateNotes()
    }
    ));
  }

  //Delete a particular note
  deleteNote(note): Observable<Note> {
    const payload = { userid: this.user.userId, noteid: note.noteId };
    return this.http.post<Note>(`${this.url}/delete`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateNotes()
      this.alertUsersOnUpdate(note)
    }
    ));
  }

  //Update the note with modified title/description
  editNote(note): Observable<Note> {
    const payload = { userid: this.user.userId, noteid: note.noteId, title: note.title, content: note.content };
    return this.http.put<Note>(`${this.url}/update`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateNotes()
      this.alertUsersOnUpdate(note)
    }
    ));
  }

  //Add the note selected to selectedNotes array
  addSelectedNote(note: Note) {
    this.selectedNotes.push(note);
    this.selectedNotesSubject.next(this.selectedNotes);
  }

  //Remove the note selected from selectedNotes array
  removeSelectedNote(note: Note) {
    this.selectedNotes.splice(this.selectedNotes.indexOf(note), 1);
    this.selectedNotesSubject.next(this.selectedNotes);
  }

  //Get all notes selected by the user
  getSelectedNotes(): Observable<Array<Note>> {
    return this.selectedNotesSubject;
  }

  //Clear all selected notes
  clearSelectedNotes() {
    this.selectedNotes = [];
    this.selectedNotesSubject.next(this.selectedNotes);
  }

  //Change search text with text entered in search bar
  changeSearchText(text) {
    this.searchText = text;
    this.searchTextSubject.next(this.searchText);
  }

  //Get the current text entered in search bar
  getSearchText(): Observable<string> {
    return this.searchTextSubject;
  }

  //Share a note with other user
  shareNote(note, shareUserId, sharePermission): Observable<Note> {
    const payload = { userid: this.user.userId, noteid: note.noteId, shareuserid: shareUserId, sharepermission: sharePermission };
    return this.http.post<Note>(`${this.url}/share`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateNotes();
      this.socketIo.emitEventOnNoteShared({ parentUserId: note.userId, shareUserId: shareUserId });
    }
    ));
  }

  //Unshare a note which was already shared
  unshareNote(note, shareUserId): Observable<Note> {
    const payload = { userid: this.user.userId, noteid: note.noteId, shareuserid: shareUserId };
    return this.http.post<Note>(`${this.url}/unshare`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateNotes();
      this.socketIo.emitEventOnSharedNoteEdited(shareUserId);
    }
    ));
  }

  //Get details about a particular note
  getNoteDetails(noteId): Observable<any> {
    const payload = { noteid: noteId };
    return this.http.post<Array<Note>>(`${this.url}/note`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    })
  }

  //Alert other users if a shared note is updated
  alertUsersOnUpdate(note) {
    if (note.hasOwnProperty('sharedNotes') && note.sharedNotes.length > 0) {
      note.sharedNotes.forEach(result => {
        this.socketIo.emitEventOnSharedNoteEdited(result.userId);
      })
    }

    if (note.hasOwnProperty('parentNoteId') && note.parentNoteId != '') {
      this.getNoteDetails(note.parentNoteId).subscribe(
        note => {
          this.socketIo.emitEventOnSharedNoteEdited(note.userId);
          note.sharedNotes.forEach(result => {
            this.socketIo.emitEventOnSharedNoteEdited(result.userId);
          })
        },
        err => {
          console.log(err);
        }
      );
    }
  }

}
