import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Toast } from '../templates/toast';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  toastInput: Toast;
  toastInputSubject: BehaviorSubject<Toast>;

  lockNotes: Array<string>;
  lockNotesSubject: BehaviorSubject<Array<string>>;

  socketResponses: Array<string>;
  socketResponsesSubject: BehaviorSubject<Array<string>>;

  constructor() {
    this.toastInput = new Toast;
    this.toastInputSubject = new BehaviorSubject(this.toastInput);

    this.lockNotes = [];
    this.lockNotesSubject = new BehaviorSubject(this.lockNotes);

    this.socketResponses = [];
    this.socketResponsesSubject = new BehaviorSubject(this.socketResponses);
  }

  //Change toast message inputs
  changeToastInput(status?, type?, message?, data?) {
    this.toastInput = {
      status: status || undefined,
      type: type || undefined,
      message: message || undefined,
      data: data || undefined
    }
    this.toastInputSubject.next(this.toastInput);
  }

  //Get toast message inputs
  getToastInput(): Observable<Toast> {
    return this.toastInputSubject;
  }

  //Add a new note to lockNotes array
  addLockNote(val) {
    this.lockNotes.push(val);
    this.lockNotesSubject.next(this.lockNotes);
  }

  //Remove a new note from lockNotes array
  removeLockNote(val) {
    this.lockNotes.splice(this.lockNotes.indexOf(val), 1);
    this.lockNotesSubject.next(this.lockNotes);
  }

  //Get all notes which are locked
  getLockNotes(): Observable<Array<string>> {
    return this.lockNotesSubject;
  }

  //Clear all lock notes
  clearLockNotes() {
    this.lockNotes = [];
    this.lockNotesSubject.next(this.lockNotes);
  }

  //Add socket response to socketResponses array
  addSocketResponse(val) {
    this.socketResponses.push(val);
    this.socketResponsesSubject.next(this.socketResponses);
  }
  
  //Remove a socket response from socketResponses array
  removeSocketResponse(val) {
    this.socketResponses.splice(this.socketResponses.indexOf(val), 1);
    this.socketResponsesSubject.next(this.socketResponses);
  }

  //Get all responses from socketResponses array
  getSocketResponses(): Observable<Array<string>> {
    return this.socketResponsesSubject;
  }

  //Clear all sokcet responses
  clearSocketResponses() {
    this.socketResponses = [];
    this.socketResponsesSubject.next(this.socketResponses);
  }

}
