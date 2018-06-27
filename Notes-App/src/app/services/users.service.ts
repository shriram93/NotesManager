import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { User } from '../templates/user';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { NotesService } from './notes.service';
import { GroupsService } from './groups.service';
import { Group } from '../templates/group';
import { Toast } from '../templates/toast';
import { SocketIoService } from './socket-io.service';
import { RemaindersService } from './remainders.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  user: User;
  userSubject: BehaviorSubject<User>;
  beaerToken: string;
  beaerTokenSubject: BehaviorSubject<string>;
  private url = 'http://localhost:3000/api/v1/users';

  constructor(private router: Router, private http: HttpClient, public dataService: DataService, public notesService: NotesService, public groupsService: GroupsService, public socketIoService: SocketIoService, public remaindersService: RemaindersService) {
    this.user = new User;
    this.userSubject = new BehaviorSubject(this.user);
    this.beaerToken = 'Undefined';
    this.beaerTokenSubject = new BehaviorSubject(this.beaerToken);
  }

  //Register a new user
  registerUser(userDetails): Observable<any> {
    const payload = { name: userDetails.name, email: userDetails.email, password: userDetails.password };
    return this.http.post(`${this.url}/register`, payload);
  }

  //Login user with credentials
  loginUser(userDetails): Observable<any> {
    const payload = { email: userDetails.email, password: userDetails.password };
    return this.http.post(`${this.url}/login`, payload).pipe(tap(res => {
      this.beaerToken = res.token;
      this.beaerTokenSubject = new BehaviorSubject(this.beaerToken);
    }
    ));
  }

  //Get other users details
  getOtherUsers(): Observable<Array<User>> {
    const payload = { userid: this.user.userId };
    return this.http.post<Array<User>>(`${this.url}/otherusers`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.beaerToken}`)
    })
  }

  //Get details of a particular user
  getUserDetails(userId): Observable<any> {
    const payload = { userid: userId };
    return this.http.post<User>(`${this.url}/detail`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.beaerToken}`)
    })
  }

  //Update userSubject with current logged in user details
  updateLoginUserDetails(userId): Observable<any> {
    const payload = { userid: userId };
    return this.http.post<User>(`${this.url}/detail`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.beaerToken}`)
    }).pipe(tap(user => {
      this.user = user;
      this.userSubject.next(this.user);
      this.login();
    }));
  }

  //Get details of current logged in user
  getLoginUserDetails(): Observable<User> {
    return this.userSubject;
  }

  //Get bearer token created while logging in the app
  getBearerToken(): Observable<string> {
    return this.beaerTokenSubject;
  }

  //Intializing notes,groups and remainders when a user logs in 
  login() {
    this.notesService.updateNotes(this.beaerToken, this.user);
    this.groupsService.updateGroups(this.beaerToken, this.user);
    this.remaindersService.updateRemainders(this.beaerToken, this.user);
    this.remaindersService.getIntialRemainders(this.beaerToken, this.user).subscribe();
  }

  //Resetting the application when a user logs out
  logout() {
    this.socketIoService.emitEventUserLogout(this.user.userId);
    this.router.navigate(['/']);
    this.user = new User;
    this.userSubject.next(this.user);
    this.beaerToken = 'Undefined';
    this.beaerTokenSubject = new BehaviorSubject(this.beaerToken);
    this.dataService.clearLockNotes();
    this.dataService.changeToastInput('reset', undefined, undefined, undefined);
    this.notesService.changeSearchText('');
    this.notesService.clearSelectedNotes();
    this.groupsService.changeSelectedGroup(new Group);
  }

}
