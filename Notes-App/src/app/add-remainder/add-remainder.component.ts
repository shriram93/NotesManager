import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Note } from '../templates/note';
import { RemaindersService } from '../services/remainders.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-remainder',
  templateUrl: './add-remainder.component.html',
  styleUrls: ['./add-remainder.component.css']
})
export class AddRemainderComponent implements OnInit {

  selectedDate: Date;
  hours: Array<Number>;
  minutes: Array<Number>;
  selectedHour: String;
  selectedMinutes: String;
  selectedAmPm: String;
  errorMessage: string;
  constructor(public dialogRef: MatDialogRef<AddRemainderComponent>, @Inject(MAT_DIALOG_DATA) public note: Note, public remaindersService: RemaindersService) {
    this.errorMessage = 'empty';
    this.hours = Array.from({ length: 12 }, (v, k) => k + 1);
    this.minutes = Array.from({ length: 60 }, (v, k) => k++);
    const currentDate = new Date();
    this.selectedDate = currentDate;

    //Populate current time in choose a time form
    let hour, mins, ampm;

    hour = currentDate.getHours();
    ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '1

    mins = currentDate.getMinutes();

    this.selectedHour = hour;
    this.selectedMinutes = mins;
    this.selectedAmPm = ampm;
  }

  ngOnInit() {
  }

  onDate(event) {
    //console.log(this.selectedDate);
  }
  
  //Disable dates older dhan current date
  myFilter = (d: Date): boolean => {
    const currentDate: Date = new Date();
    const year = d.getFullYear();
    const date = d.getDate();
    const month = d.getMonth();
    // Prevent date less dhan current date 
    if (year < currentDate.getFullYear() || month < currentDate.getMonth() || (month == currentDate.getMonth() && date < currentDate.getDate())) {
      return false;
    }
    return true;
  }

  //Add 0 before minutes from 0 to 9
  formatTime(num) {
    const str = num.toString();
    if (str.length == 1)
      return '0' + str;
    else
      return str
  }

  closeDialog(userInput) {
    if (userInput == "Add") {
      //Check if the remainer time is greater than current time, if not throw error
      const date = moment(this.selectedDate).format('DD/MM/YYYY');
      const time = this.selectedHour + ':' + this.selectedMinutes + ' ' + this.selectedAmPm;
      const remainderDateTime = date + ' ' + time;

      const currentDateTime = moment(new Date());
      const selectedDateTime = moment(remainderDateTime, 'DD/MM/YYYY hh:mm A');

      if (currentDateTime >= selectedDateTime) {
        this.errorMessage = "Remainder time should be in future";
        return;
      }
      if (remainderDateTime) {
        //If the remainder time is valid add the remainder in database
        this.remaindersService.addRemainder(this.note, remainderDateTime).subscribe(
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
