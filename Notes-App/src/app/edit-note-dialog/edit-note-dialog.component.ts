import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Note } from '../templates/note';
import { NotesService } from '../services/notes.service';

@Component({
  selector: 'app-edit-note-dialog',
  templateUrl: './edit-note-dialog.component.html',
  styleUrls: ['./edit-note-dialog.component.css']
})
export class EditNoteDialogComponent implements OnInit {

  note:Note;
  errorMessage: string;
  constructor(public dialogRef: MatDialogRef<EditNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public prevNote: Note, private notesService: NotesService) {
  }

  ngOnInit() {
    this.note = new Note;
    this.note = JSON.parse(JSON.stringify(this.prevNote));
    this.errorMessage = 'empty';
  }
  
  closeDialog(userInput) {
    if (userInput == "Create") {
      //If note title/description is blank, throw error
      if (this.note.title == "" || this.note.content == "") {
        this.errorMessage = "You must fill in all the fields";
        return;
      }
      //Save the edited note in database
      this.notesService.editNote(this.note).subscribe(
        res => {
          this.dialogRef.close();
        },
        err => {
          console.log(err);
        });
    }
    else {
      this.dialogRef.close();
    }
  }
}
