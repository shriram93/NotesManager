import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Remainder } from '../templates/remainder';
import { Note } from '../templates/note';
import { NotesService } from './notes.service';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SocketIoService } from './socket-io.service';
import * as moment from 'moment';
import { User } from '../templates/user';
@Injectable({
  providedIn: 'root'
})
export class RemaindersService {

  private url = 'http://localhost:3000/api/v1/remainders';
  bearerToken: string;
  remainders: Array<Remainder>;
  remaindersSubject: BehaviorSubject<Array<Remainder>>;
  user: User;

  constructor(private http: HttpClient, private notesService: NotesService, private socketIo: SocketIoService) {
    this.remainders = [];
    this.remaindersSubject = new BehaviorSubject(this.remainders);
  }

  //Load all remainders and iregister them in the server, this will be done only once
  getIntialRemainders(token, user): Observable<Array<Remainder>> {
    if (user.userId && token) {
      const payload = { userid: user.userId };
      return this.http.post<Array<Remainder>>(`${this.url}`, payload, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${token}`)
      }).pipe(tap(remainders => {
        remainders.forEach(
          remainder => {
            if (remainder.isDismissed == false) {
              this.socketIo.emitEventOnRegisterRemainder(remainder);
            }
          }
        );
      }
      ));
    }
  }

  //Get all remainders created by the user
  getRemainders(): Observable<Array<Remainder>> {
    return this.remaindersSubject;
  }

  //Update remaindersSubject with all the remainders created by the user
  updateRemainders(token?, user?) {
    if (token)
      this.bearerToken = token;
    if (user)
      this.user = user;
    if (this.user.userId && this.bearerToken) {
      const payload = { userid: this.user.userId };
      return this.http.post<Array<Remainder>>(`${this.url}`, payload, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.bearerToken}`)
      }).subscribe(remainders => {
        this.remainders = remainders;
        this.remaindersSubject.next(this.remainders);
      })
    }
  }

  //Add a new remainder to a note
  addRemainder(note: Note, remainerTime): Observable<Remainder> {
    const payload = { userid: note.userId, noteid: note.noteId, remaindertime: remainerTime };
    console.log(payload);
    return this.http.post<Remainder>(`${this.url}/create`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.notesService.updateNotes();
      this.updateRemainders();
      if (res.isDismissed == false) {
        this.socketIo.emitEventOnRegisterRemainder(res);
      }
    }
    ));
  }

  //Get details about a particular remainder
  getRemainder(note: Note): Observable<Remainder> {
    const payload = { userid: note.userId, remainderid: note.remainderId };
    return this.http.post<Remainder>(`${this.url}/detail`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    });
  }

  //Delete a remainder of a note
  deleteRemainder(note: Note): Observable<Remainder> {
    const payload = { userid: note.userId, noteid: note.noteId, remainderid: note.remainderId };
    return this.http.post<Remainder>(`${this.url}/delete`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.notesService.updateNotes();
      this.updateRemainders();
      this.socketIo.emitEventOnUnregisteRemainder(note.remainderId);
    }
    ));
  }

  //Dismiss note remainder
  dismissRemainder(note: Note): Observable<Remainder> {
    const payload = { userid: note.userId, remainderid: note.remainderId };
    return this.http.post<Remainder>(`${this.url}/dismiss`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateRemainders();
      this.socketIo.emitEventOnUnregisteRemainder(note.remainderId);
    }
    ));
  }

  //Snooze remiander for 5 minutes
  snoozeRemainder(note: Note, snoozeInterval): Observable<Remainder> {
    const payload = { userid: note.userId, remainderid: note.remainderId, snoozetime: snoozeInterval };
    return this.http.post<Remainder>(`${this.url}/snooze`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateRemainders();
      if (res.isDismissed == false) {
        this.socketIo.emitEventOnRegisterRemainder(res);
      }
    }
    ));
  }

}
