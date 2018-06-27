import { Component, OnInit } from '@angular/core';
import { Note } from '../templates/note';
import { NotesService } from '../services/notes.service';
import { GroupsService } from '../services/groups.service';
import { ConfirmDeleteNoteDialogComponent } from '../confirm-delete-note-dialog/confirm-delete-note-dialog.component';
import { AddNoteToGroupDialogComponent } from '../add-note-to-group-dialog/add-note-to-group-dialog.component';
import { MatDialog } from "@angular/material";
import { Group } from '../templates/group';
import { UsersService } from '../services/users.service';
import { User } from '../templates/user';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  selectedNotes: Array<Note>;
  selectedGroup: Group;
  user: User;
  searchEnable: boolean;
  myControl: FormControl = new FormControl();

  constructor(public dialog: MatDialog, public notesService: NotesService, public groupService: GroupsService, public usersService: UsersService) {
    //Get all selected notes
    this.notesService.getSelectedNotes().subscribe(
      notes => {
        this.selectedNotes = notes;
      },
      err => {
        console.log(err);
      }
    );
    //Get selected group
    this.groupService.getSelectedGroup().subscribe(
      group => {
        this.selectedGroup = group;
        if (this.selectedGroup.groupId != '') {
          this.searchEnable = false;
        }
      },
      err => {
        console.log(err);
      }
    );
    //Get logged in user details
    this.usersService.getLoginUserDetails().subscribe(
      user => {
        this.user = user;
      },
      err => {
        console.log(err);
      }
    );
    this.searchEnable = false;
  }

  ngOnInit() {
    this.myControl.valueChanges
      .subscribe(val => {
        this.notesService.changeSearchText(val);
      });
  }

  //Format logged in user name
  getUserName() {
    return this.user.name.substr(0, 1).toUpperCase() + this.user.name.substr(1).toLowerCase();
  }

  //Clear selected note/notes
  clearSelectedNotes() {
    this.notesService.clearSelectedNotes();
    this.disableSearchNote()
  }

  //Clear selected group
  clearSelectedGroup() {
    this.groupService.changeSelectedGroup(new Group);
    this.disableSearchNote()
  }

  //Enable search note container
  enableSearchNote() {
    this.searchEnable = true;
  }

  //Disable search note container
  disableSearchNote() {
    this.searchEnable = false;
    this.notesService.changeSearchText('');
    this.myControl.setValue('');
  }

  //When user clicks on search note shift the focus to input box
  setFocusOnInput() {
    let inputField: HTMLElement = <HTMLElement>document.querySelector('.search-box');
    inputField.focus();
  }

  //Add the selected notes which are not already Favorite to Favorite
  addToFavorite() {
    this.selectedNotes.forEach(note => {
      if (note.favorite === false) {
        this.notesService.toggleFavorite(note.noteId).subscribe(
          res => { },
          err => {
            console.log(err);
          }
        );
      }
    });
    this.notesService.clearSelectedNotes();
  }

  //Add the selected notes which are not already Unfavorite to Unfavorite
  removeFromFavorite() {
    this.selectedNotes.forEach(note => {
      if (note.favorite === true) {
        this.notesService.toggleFavorite(note.noteId).subscribe(
          res => { },
          err => {
            console.log(err);
          }
        );
      }
    });
    this.notesService.clearSelectedNotes();
  }

  //Open delete note confirmation dialog box
  deleteNotes() {
    this.dialog.open(ConfirmDeleteNoteDialogComponent, {
      autoFocus: false,
      data: this.selectedNotes, width: '450px'
    });
  }

  //Open add to group dialog box
  addNotesToGroup() {
    this.dialog.open(AddNoteToGroupDialogComponent, {
      autoFocus: false,
      data: this.selectedNotes,
      width: '400px'
    });
  }

  //Logsout the user from the application
  logout() {
    this.usersService.logout();
  }


}
