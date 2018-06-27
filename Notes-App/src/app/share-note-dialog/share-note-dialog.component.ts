import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Note } from '../templates/note';
import { UsersService } from '../services/users.service';
import { NotesService } from '../services/notes.service';
import { User } from '../templates/user';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-share-note-dialog',
  templateUrl: './share-note-dialog.component.html',
  styleUrls: ['./share-note-dialog.component.css']
})
export class ShareNoteDialogComponent implements OnInit {

  currentUsers = [];
  users = [];
  myControl: FormControl = new FormControl();
  filteredItems: Observable<string[]>;
  errorMessage: string;
  selectedUserId: string;
  selectedPermission: string;
  sharedUsers = [];
  constructor(public dialogRef: MatDialogRef<ShareNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public note: Note, public usersService: UsersService, public notesService: NotesService) {
    //Get other users details to share note with them
    this.usersService.getOtherUsers().subscribe(
      users => {
        this.users = users;
        this.note.sharedNotes.forEach(
          note => {
            //If note is already shared, get the user details
            this.usersService.getUserDetails(note.userId).subscribe(
              user => {

                //Format shared user name and email address
                if (user.name.length > 20)
                  user.name = user.name.substring(0, 20) + "...";

                if (user.email.length > 20)
                  user.email = user.email.substring(0, 20) + "...";

                this.sharedUsers.push(user);
              },
              err => {
                console.log(err);
              }
            );
          }
        );
        this.errorMessage = 'empty';
        this.selectedUserId = '';
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
  }

  //Filter the other users to share as and when the user starts typing
  filter(val: string): string[] {
    if (val == '') {
      this.selectedUserId = '';
    }
    return this.currentUsers.filter(user =>
      user.email.toLowerCase().includes(val.toLowerCase())

    );
  }

  //When the selects any user, update the list of available users again
  updateUserList() {
    this.currentUsers = this.users.filter(user => {
      let result = true;
      this.sharedUsers.forEach(sharedUser => {
        if (user.userId == sharedUser.userId)
          result = false;
      })
      return result;
    });
    this.filteredItems = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter(val))
      );
  }

  //Store the other user id selected
  shareNoteWith(userId) {
    this.selectedUserId = userId;
  }

  //Unshare the note with this user
  unshareNote(userId) {
    this.notesService.unshareNote(this.note, userId).subscribe(
      res => {
        this.sharedUsers.splice(this.getShareUserIndex(userId, this.sharedUsers), 1);
      },
      err => {
        console.log(err);
      }
    );
  }

  //Search for a matching user using userId in users object array
  getShareUserIndex(userId, users) {
    let index = -1;
    users.some(function (entry, i) {
      if (entry.userId == userId) {
        index = i;
        return true;
      }
    });
    return index;
  }

  closeDialog(userInput) {
    if (userInput == "Save") {
      //If any field is empty/undefined, throw error
      if (this.selectedUserId == "" || this.selectedUserId == undefined || this.selectedPermission == "" || this.selectedPermission == undefined) {
        this.errorMessage = "You must fill in all the fields";
        return;
      }
      else {
        //Share the note with the user selected
        this.notesService.shareNote(this.note, this.selectedUserId, this.selectedPermission).subscribe(
          res => {
            this.dialogRef.close();
          },
          err => {
            console.log(err);
          }
        );
      }
    }
    else {
      this.dialogRef.close();
    }
  }


}
