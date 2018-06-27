import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../services/data.service';
import { ifError } from 'assert';

@Component({
  selector: 'app-toast-notification',
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.css']
})
export class ToastNotificationComponent implements OnInit {
  toastMessage: string;
  toastData: any;
  toastType: string;
  toastStatus: string;

  //Handle when user clicks on any action
  @Output() goToastClose = new EventEmitter<{}>();

  constructor(public dataService: DataService) {
  }

  ngOnInit() {
    //Get the current toast input details
    this.dataService.getToastInput().subscribe(
      toast => {
        //Create DOM reference for toast 
        const elem = document.getElementById('toast');
        if (elem) {
          this.toastMessage = toast.message;
          this.toastData = toast.data;
          this.toastType = toast.type;
          this.toastStatus = toast.status;
          //if the status is open, then show the toast
          if (this.toastStatus == 'open') {
            if (elem.className == '') {
              elem.className = 'show';
            }
          }
          //if the status is clos, then hide the toast
          else if (this.toastStatus == 'close') {
            if (elem.className == 'show') {
              elem.className = 'hide';
            }
          }
          //if the status is reset, then remove all classes
          else if (this.toastStatus == 'reset') {
            elem.className = '';
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }


  onCloseToast(action) {
    //Store all the current toast details into data
    const data = {
      action: action,
      toastData: this.toastData,
      toastType: this.toastType,
      toastMessage: this.toastMessage
    }

    //Pass the data back into calling component
    this.goToastClose.emit(data);
  }

}
