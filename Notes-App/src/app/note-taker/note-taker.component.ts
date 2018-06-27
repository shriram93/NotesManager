import { Component, OnInit } from '@angular/core';
import { NotesService } from '../services/notes.service';
import { GroupsService } from '../services/groups.service';
import { Note } from '../templates/note';
import { Group } from '../templates/group';

@Component({
  selector: 'app-note-taker',
  templateUrl: './note-taker.component.html',
  styleUrls: ['./note-taker.component.css']
})
export class NoteTakerComponent implements OnInit {
  note: Note;
  errorMessage: string;
  selectedGroup: Group;
  constructor(private notesService: NotesService, private groupsService: GroupsService) {
    //Get selected group
    this.groupsService.getSelectedGroup().subscribe(
      group => {
        this.selectedGroup = group;
      },
      err => {
        console.log(err);
      });
  }

  ngOnInit() {
    this.note = new Note;
    this.errorMessage = 'empty';
  }

  takeNote() {
    this.notesService.clearSelectedNotes();
    //If note title/description is empty, throw error
    if (this.note.title == "" || this.note.content == "") {
      this.errorMessage = "Please fill in all the fields";
      return;
    }
    if (this.selectedGroup.groupId != '') {
      //Add new note to the selected group
      this.notesService.addNote(this.note, this.selectedGroup.groupId).subscribe(
        data => {
          this.note = new Note();
        },
        err => {
          console.log(err);
          this.errorMessage = err.message;
        }
      );
    }
    else {
      //Add new note
      this.notesService.addNote(this.note).subscribe(
        data => {
          this.note = new Note();
        },
        err => {
          console.log(err);
          this.errorMessage = err.message;
        }
      );
    }
  }
}
