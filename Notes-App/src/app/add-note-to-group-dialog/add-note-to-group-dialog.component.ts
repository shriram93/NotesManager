import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GroupsService } from '../services/groups.service';
import { Group } from '../templates/group';
import { FormControl } from '@angular/forms';
import { NotesService } from '../services/notes.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Note } from '../templates/note';

@Component({
  selector: 'app-add-note-to-group-dialog',
  templateUrl: './add-note-to-group-dialog.component.html',
  styleUrls: ['./add-note-to-group-dialog.component.css']
})
export class AddNoteToGroupDialogComponent implements OnInit {

  groups: any;
  selectedGroupId: string;
  errorMessage: string;
  myControl: FormControl = new FormControl();
  filteredItems: Observable<string[]>;

  constructor(public dialogRef: MatDialogRef<AddNoteToGroupDialogComponent>, @Inject(MAT_DIALOG_DATA) public notes: Array<Note>, private groupsService: GroupsService, public notesService: NotesService) {
    //Get all groups to show in the auto complete box
    this.groupsService.getGroups().subscribe(
      groups => {
        this.groups = groups;
        this.selectedGroupId = '';
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnInit() {
    this.filteredItems = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filter(val))
      );
    this.errorMessage = 'empty';
  }

  //Filter the group name when the user types each character
  filter(val: string): string[] {
    if (val == "") {
      this.selectedGroupId = "";
    }
    return this.groups.filter(group =>
      group.title.toLowerCase().includes(val.toLowerCase()));
  }

  selectGroup(groupId) {
    this.selectedGroupId = groupId;
  }

  closeDialog(userInput) {
    if (userInput == "Add") {
      if (this.selectedGroupId == "") {
        this.errorMessage = "You must fill in all the fields";
        return;
      }
      else {
        //Add note/notes to the group selected by the user
        this.notes.forEach(note => {
          this.groupsService.addNoteToGroup(this.selectedGroupId, note.noteId).subscribe(
            res => {
              this.dialogRef.close();
            },
            err => {
              console.log(err);
            }
          );
        });
        //If multiple notes were selected earlier clear those values
        this.notesService.clearSelectedNotes();
      }
    }
    else {
      this.dialogRef.close();
    }
  }
}
