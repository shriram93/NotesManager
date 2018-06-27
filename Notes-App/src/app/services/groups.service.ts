import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Group } from '../templates/group';
import { tap } from 'rxjs/operators';
import { NotesService } from './notes.service';
import { User } from '../templates/user';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  groups: Array<Group>;
  selectedGroup: Group;
  groupsSubject: BehaviorSubject<Array<Group>>;
  selectedGroupSubject: BehaviorSubject<Group>;
  bearerToken: string;
  user: User;
  private url = 'http://localhost:3000/api/v1/groups';

  constructor(private http: HttpClient, public notesService: NotesService) {
    this.groups = [];
    this.groupsSubject = new BehaviorSubject(this.groups);
    this.selectedGroup = new Group;
    this.selectedGroupSubject = new BehaviorSubject(this.selectedGroup);
  }

  //Creata a new group
  createGroup(group): Observable<Group> {
    const payload = { userid: this.user.userId, title: group.title, description: group.description };
    return this.http.post<Group>(`${this.url}/create`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateGroups()
    }
    ));
  }

  //Delete a group for a user
  deleteGroup(groupId): Observable<Group> {
    const payload = { userid: this.user.userId, groupid: groupId };
    return this.http.post<Group>(`${this.url}/delete`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateGroups()
    }
    ));
  }

  //Get all groups created by the user
  getGroups(): Observable<Array<Group>> {
    return this.groupsSubject;
  }

  //Update groupsSubject with all groups created by the user
  updateGroups(token?, user?) {
    if (token)
      this.bearerToken = token;
    if (user)
      this.user = user;
    if (this.user.userId && this.bearerToken) {
      const payload = { userid: this.user.userId };
      return this.http.post<Array<Group>>(`${this.url}`, payload, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.bearerToken}`)
      }).subscribe(groups => {
        this.groups = groups;
        this.groupsSubject.next(this.groups);
      });
    }
  }

  //Add a note to the group
  addNoteToGroup(groupId, noteId): Observable<Group> {
    const payload = { userid: this.user.userId, groupid: groupId, noteid: noteId };
    return this.http.post<Group>(`${this.url}/addnote`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateGroups();
      this.notesService.updateNotes();
    }
    ));
  }

  //Remove a note from the group
  removeNoteFromGroup(groupId, noteId): Observable<Group> {
    const payload = { userid: this.user.userId, groupid: groupId, noteid: noteId };
    return this.http.post<Group>(`${this.url}/removenote`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    }).pipe(tap(res => {
      this.updateGroups();
      this.notesService.updateNotes();
    }
    ));
  }

  //Get the group details
  getGroupDetails(groupId): Observable<Group> {
    const payload = { userid: this.user.userId, groupid: groupId };
    return this.http.post<Group>(`${this.url}/group`, payload, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.bearerToken}`)
    });
  }

  //Change selected group
  changeSelectedGroup(group) {
    this.selectedGroup = group;
    this.selectedGroupSubject.next(this.selectedGroup);
  }

  //Get the current selected group
  getSelectedGroup() {
    return this.selectedGroupSubject;
  }

}
