import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GroupsService } from '../services/groups.service';
import { Group } from '../templates/group';
@Component({
  selector: 'app-confirm-delete-group-dialog',
  templateUrl: './confirm-delete-group-dialog.component.html',
  styleUrls: ['./confirm-delete-group-dialog.component.css']
})
export class ConfirmDeleteGroupDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteGroupDialogComponent>, @Inject(MAT_DIALOG_DATA) public groupId: string, private groupsService: GroupsService) {
  }
  ngOnInit() {
  }

  closeDialog(userInput) {
    //If the user selects Yes, delete the group
    if (userInput == "Yes") {
      this.groupsService.deleteGroup(this.groupId).subscribe(
        res => {
          this.groupsService.changeSelectedGroup(new Group);
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
