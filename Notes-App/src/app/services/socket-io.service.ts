import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io.connect('http://localhost:5000');
  }

  //Emit: user login details
  emitEventUserLogin(userId) {
    this.socket.emit('login', userId);
  }

  //Emit: user login details
  emitEventUserLogout(userId) {
    this.socket.emit('logout', userId);
  }

  // Emit: note shared
  emitEventOnNoteShared(userDetails) {
    this.socket.emit('noteShared', userDetails);
  }

  // Emit: register remainder
  emitEventOnRegisterRemainder(remainder) {
    this.socket.emit('registerRemainder', remainder);
  }


  emitEventOnUnregisteRemainder(remainderId) {
    this.socket.emit('unregisterRemainder', remainderId);
  }
  // Emit: gist shared note edited
  emitEventOnSharedNoteEdited(userId) {
    this.socket.emit('sharedNoteEdited', userId);
  }


  // Consume: on note shared
  consumeEventOnNoteShared() {
    return Observable.create(observer => {
      this.socket.on('noteShared', res => {
        observer.next(res);
      });
    });
  }

  // Consume: on shared note edited
  consumeEventOnSharedNoteEdited() {
    return Observable.create(observer => {
      this.socket.on('sharedNoteEdited', res => {
        observer.next(res);
      });
    });
  }

  // Consume: on remiander notification
  consumeEventOnNotifyRemainder() {
    return Observable.create(observer => {
      this.socket.on('notifyRemainder', res => {
        observer.next(res);
      });
    });
  }

  // Consume: on remiander notification before 15 mins
  consumeEventOnPreNotifyRemainder() {
    return Observable.create(observer => {
      this.socket.on('preNotifyRemainder', res => {
        observer.next(res);
      });
    });
  }

}

