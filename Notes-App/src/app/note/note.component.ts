import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Note } from '../templates/note';
import { ConfirmDeleteNoteDialogComponent } from '../confirm-delete-note-dialog/confirm-delete-note-dialog.component';
import { AddNoteToGroupDialogComponent } from '../add-note-to-group-dialog/add-note-to-group-dialog.component';
import { EditNoteDialogComponent } from '../edit-note-dialog/edit-note-dialog.component';
import { MatDialog } from "@angular/material";
import { GroupsService } from '../services/groups.service';
import { NotesService } from '../services/notes.service';
import { UsersService } from '../services/users.service';
import { Group } from '../templates/group';
import { ShareNoteDialogComponent } from '../share-note-dialog/share-note-dialog.component';
import { AddRemainderComponent } from '../add-remainder/add-remainder.component';
import { User } from '../templates/user';
import { RemaindersService } from '../services/remainders.service';
import { DataService } from '../services/data.service';
import * as moment from 'moment';
import { Remainder } from '../templates/remainder';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {

  @Input() note: Note;
  @Output() goToggleFav = new EventEmitter<string>();
  @Output() goSelectNote = new EventEmitter<{}>();

  noteSelected: boolean;
  selectedNotes: Array<Note>;
  selectedGroup: Group;
  groups: Array<Group>;
  parentUser: User;
  remainderTime: string;
  lockDeleteRemainder: boolean;
  isRemainderDismissed: boolean;
  remainder: Remainder;

  constructor(public dialog: MatDialog, public groupsService: GroupsService, public notesService: NotesService, public usersService: UsersService, public remainderService: RemaindersService, public dataService: DataService) {
    this.lockDeleteRemainder = false;
    this.isRemainderDismissed = false;
    //Get all valid group created by the user
    this.groupsService.getGroups().subscribe(
      groups => {
        this.groups = groups;
      },
      err => {
        console.log(err);
      }
    );
    //Check if the note is already selected by ther user
    this.notesService.getSelectedNotes().subscribe(
      notes => {
        this.selectedNotes = notes;
        if (this.selectedNotes.length === 0) {
          this.noteSelected = false;
        }
      },
      err => {
        console.log(err);
      }
    );
    //Determines the current group selected
    this.groupsService.getSelectedGroup().subscribe(
      group => {
        this.selectedGroup = group;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
    //If toast shown in the screen is for current note, then disbale delete remainder option
    this.dataService.getLockNotes().subscribe(
      notes => {
        if (notes && notes.includes(this.note.noteId)) {
          this.lockDeleteRemainder = true;
        }
        else {
          this.lockDeleteRemainder = false;
        }
      },
      err => {
        console.log(err);
      }
    );
    this.noteSelected = false;
    //If the note is shared from another user, then get the parent user details
    if (this.note.parentNoteId) {
      this.notesService.getNoteDetails(this.note.parentNoteId).subscribe(
        note => {
          if (note.userId) {
            this.usersService.getUserDetails(note.userId).subscribe(
              user => {
                this.parentUser = user;
              },
              err => {
                console.log(err);
              }
            );
          }
        },
        err => {
          console.log(err);
        }
      );
    }
    //If a remainder is already created for the note, get the details
    this.remainderService.getRemainders().subscribe(
      remainders => {
        if (this.note.remainderId) {
          const index = this.getRemainderIndex(this.note.remainderId, remainders);
          if (index != -1) {
            this.remainder = remainders[index];
            if (this.remainder.isDismissed == false) {
              this.isRemainderDismissed = false;
            }
            else {
              this.isRemainderDismissed = true;
            }
            //If the reaminder date falls today, then show 'Today' instead of date
            const dateTime = moment(this.remainder.remainderTime);
            const today = moment(new Date());
            const tomorrow = moment(new Date()).add(1, 'days');
            if (dateTime.format('DD/MM/YYYY') == today.format('DD/MM/YYYY')) {
              this.remainderTime = 'Today, ' + dateTime.format('hh:mm A');
            }
            //If the reaminder date falls tomorrow, then show 'Tomorrow' instead of date
            else if (dateTime.format('DD/MM/YYYY') == tomorrow.format('DD/MM/YYYY')) {
              this.remainderTime = 'Tomorrow, ' + dateTime.format('hh:mm A');
            }
            //Otherwise show the date
            else {
              this.remainderTime = dateTime.format('DD/MM/YYYY, hh:mm A');
            }
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  //Toggle favorite of the note
  toggleFav() {
    if (this.noteSelected === false && this.selectedNotes.length == 0) {
      this.goToggleFav.emit(this.note.noteId);
    }
  }

  //Add/delete the note to selected notes array to perform group operations
  selectNote() {
    this.noteSelected = !this.noteSelected;
    if (this.noteSelected) {
      this.notesService.addSelectedNote(this.note);
    }
    else {
      this.notesService.removeSelectedNote(this.note);
    }
  }

  //Show delete note dialog
  deleteNote() {
    this.dialog.open(ConfirmDeleteNoteDialogComponent, {
      autoFocus: false,
      data: [this.note], width: '350px'
    });
  }

  //Show add note to group dialog
  addNoteToGroup() {
    this.dialog.open(AddNoteToGroupDialogComponent, {
      autoFocus: false,
      data: [this.note],
      width: '400px'
    });
  }

  //Show remove note from group dialog
  removeNoteFromGroup(groupId, noteId) {
    this.groupsService.removeNoteFromGroup(groupId, noteId).subscribe(
      res => { },
      err => {
        console.log(err);
      }
    );
  }

  //Show edit note dialog
  editNote() {
    this.dialog.open(EditNoteDialogComponent, {
      autoFocus: false,
      data: this.note,
      width: '400px'
    });
  }

  //Show share note dialog
  shareNote() {
    this.dialog.open(ShareNoteDialogComponent, {
      autoFocus: false,
      data: this.note,
      width: '400px'
    });
  }

  //Show add remainder dialog
  addRemainder() {
    this.dialog.open(AddRemainderComponent, {
      autoFocus: false,
      data: this.note,
      width: '400px'
    });
  }

  //Delete the remiander for a note
  removeRemainder() {
    this.remainderService.deleteRemainder(this.note).subscribe(
      res => { },
      err => {
        console.log(err);
      }
    );
  }

  //If mouse enters a tag add show-icon class
  mouseEnter($event) {
    if (this.noteSelected === false && this.selectedNotes.length == 0) {
      const elem = $event.target;
      if (elem)
        elem.childNodes[2].childNodes[0].classList.add('show-icon');
    }
  }

  //If mouse leaves a tag remove show-icon class
  mouseLeave($event) {
    if (this.noteSelected === false && this.selectedNotes.length == 0) {
      const elem = $event.target;
      if (elem)
        elem.childNodes[2].childNodes[0].classList.remove('show-icon');
    }
  }

  //Format parent user name first letter if the note is shared
  getParentUserName() {
    if (this.parentUser) {
      return this.parentUser.name.substring(0, 1).toUpperCase();
    }
  }

  //Format parent user full name and email address if the note is shared
  getParentUserNameToolTip() {
    if (this.parentUser) {
      return this.parentUser.name + ' (' + this.parentUser.email + ')';
    }
  }

  //Format group name before showing to the user
  getGroupName(groupId) {
    if (this.groups.length > 0 && groupId != '') {
      const title = this.groups[this.getGroupIndex(groupId, this.groups)].title;
      if (title.length <= 8)
        return this.groups[this.getGroupIndex(groupId, this.groups)].title;
      else
        return this.groups[this.getGroupIndex(groupId, this.groups)].title.substring(0, 8) + "...";
    }
  }

  //Search for a matching group using groupId in groups object array
  getGroupIndex(groupId, groups) {
    let index = -1;
    groups.some(function (entry, i) {
      if (entry.groupId == groupId) {
        index = i;
        return true;
      }
    });
    return index;
  }

  //Search for a matching remainder using remainderId in remainders object array
  getRemainderIndex(remainderId, remainders) {
    let index = -1;
    remainders.some(function (entry, i) {
      if (entry.remainderId == remainderId) {
        index = i;
        return true;
      }
    });
    return index;
  }

}
