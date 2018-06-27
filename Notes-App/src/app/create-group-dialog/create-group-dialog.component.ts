import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GroupsService } from '../services/groups.service';
import { Group } from '../templates/group';


@Component({
  selector: 'app-create-group-dialog',
  templateUrl: './create-group-dialog.component.html',
  styleUrls: ['./create-group-dialog.component.css']
})
export class CreateGroupDialogComponent implements OnInit {

  group: Group;
  errorMessage: string;
  constructor(public dialogRef: MatDialogRef<CreateGroupDialogComponent>, private groupsService: GroupsService) {
  }
  ngOnInit() {
    this.group = new Group;
    this.errorMessage = 'empty';
  }
  closeDialog(userInput) {
    if (userInput == "Create") {
      //If group name/description is blank, throw error
      if (this.group.title == "" || this.group.description == "") {
        this.errorMessage = "You must fill in all the fields";
        return;
      }
      //Add the new group in database
      this.groupsService.createGroup(this.group).subscribe(
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
