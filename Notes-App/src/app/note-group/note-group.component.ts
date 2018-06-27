import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { NotesService } from '../services/notes.service';
import { Group } from '../templates/group';
import { CreateGroupDialogComponent } from '../create-group-dialog/create-group-dialog.component';
import { ConfirmDeleteGroupDialogComponent } from '../confirm-delete-group-dialog/confirm-delete-group-dialog.component';
import { MatDialog } from "@angular/material";

@Component({
  selector: 'app-note-group',
  templateUrl: './note-group.component.html',
  styleUrls: ['./note-group.component.css']
})
export class NoteGroupComponent implements OnInit {
  groups: Array<Group>;

  constructor(public groupsService: GroupsService, public dialog: MatDialog, public notesService: NotesService) {
    //Get the list of all group created by the user
    this.groupsService.getGroups().subscribe(
      groups => {
        this.groups = groups;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
  }

  //Select a group, to show the notes tagged under the group
  selectGroup(group) {
    this.notesService.clearSelectedNotes();
    this.groupsService.changeSelectedGroup(group);
    this.notesService.changeSearchText('');
  }

  //Show create group dialog
  createGroup() {
    this.notesService.clearSelectedNotes();
    this.dialog.open(CreateGroupDialogComponent, {
      autoFocus: false,
      width: '400px'
    });
  }


  //Show delete group dialog
  deleteGroup(groupId) {
    this.notesService.clearSelectedNotes();
    this.dialog.open(ConfirmDeleteGroupDialogComponent, {
      autoFocus: false,
      data: groupId,
      width: '400px'
    });
  }

  //If mouse enters add show-icon class
  mouseEnter($event) {
    const elem = $event.target;
    elem.childNodes[1].childNodes[0].classList.add('show-icon');
  }

  //If mouse leaves remove show-icon class
  mouseLeave($event) {
    const elem = $event.target;
    elem.childNodes[1].childNodes[0].classList.remove('show-icon');
  }

}
