import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotesService } from '../services/notes.service';
import { Note } from '../templates/note';


@Component({
  selector: 'app-confirm-delete-note-dialog',
  templateUrl: './confirm-delete-note-dialog.component.html',
  styleUrls: ['./confirm-delete-note-dialog.component.css']
})
export class ConfirmDeleteNoteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteNoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public notes: Array<Note>, private notesService: NotesService) {
  }

  ngOnInit() {
  }

  closeDialog(userInput) {
    //If the user selects Yes, delete the note/notes
    if (userInput == "Yes") {
      this.notes.forEach(note => {
        this.notesService.deleteNote(note).subscribe(
          res => { },
          err => {
            console.log(err);
          }
        );
      });
      this.notesService.clearSelectedNotes();
      this.dialogRef.close();
    }
    else {
      this.dialogRef.close();
    }
  }

}
