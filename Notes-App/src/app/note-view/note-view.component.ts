import { Component, OnInit } from '@angular/core';
import { Note } from '../templates/note';
import { NotesService } from '../services/notes.service';
import { GroupsService } from '../services/groups.service';
import { UsersService } from '../services/users.service';
import * as moment from 'moment';
import { Group } from '../templates/group';
import { SocketIoService } from '../services/socket-io.service';
import { DataService } from '../services/data.service';
import { RemaindersService } from '../services/remainders.service';

@Component({
  selector: 'app-note-view',
  templateUrl: './note-view.component.html',
  styleUrls: ['./note-view.component.css']
})
export class NoteViewComponent implements OnInit {
  catgNotes: Array<Note>;
  allNotes: Array<Note>;
  notes: Array<Note>;
  selectedNotes: Array<Note>;
  selectedGroup: Group;
  lockNotes: Array<string>;
  socketResponses: Array<string>;
  toastStatus: string;
  constructor(private notesService: NotesService, public groupsService: GroupsService, public usersService: UsersService, public socketIo: SocketIoService, public dataService: DataService, public remaindersService: RemaindersService) {
    //Add socket.io responses in an array, to filter duplicate triggers
    this.dataService.getSocketResponses().subscribe(
      responses => {
        this.socketResponses = responses;
      },
      err => {
        console.log(err);
      }
    );
    //Get selected group
    this.groupsService.getSelectedGroup().subscribe(
      group => {
        this.selectedGroup = group;
        //Get all notes created by the user
        this.notesService.getNotes().subscribe(
          notes => {
            this.allNotes = notes;
            this.allNotes.sort(this.compareNotes);
            if (this.selectedGroup.groupId != '') {
              this.catgNotes = this.allNotes.filter(note => {
                if (note.groupId == this.selectedGroup.groupId) {
                  return true;
                }
              });
            }
            else {
              this.catgNotes = this.allNotes;
            }
            //Get the text entered in the search bar, if any
            this.notesService.getSearchText().subscribe(searchText => {
              if (searchText != '') {
                this.notes = this.catgNotes.filter(note => {
                  if (note.title.toLowerCase().includes(searchText.toLowerCase())) {
                    return true;
                  }
                })
              }
              else {
                this.notes = this.catgNotes;
              }
            })
            this.selectedNotes = [];
          },
          err => { }
        );
      },
      err => { }
    );
    //Get current toast status
    this.dataService.getToastInput().subscribe(
      toast => {
        this.toastStatus = toast.status;
      },
      err => {
        console.log(err);
      });
  }

  ngOnInit() {
    //Listener for notify remiander socket trigger, will be called on the exact remainder time
    this.socketIo.consumeEventOnNotifyRemainder().subscribe(
      res => {
        //Check if this is an duplicate trigger
        const index = this.socketResponses.indexOf(res.resposneId);
        if (index == -1) {
          this.dataService.addSocketResponse(res.resposneId);
          this.notesService.getNoteDetails(res.remainder.noteId).subscribe(
            note => {
              //Frame toast message
              this.dataService.addLockNote(note.noteId);
              let title = note.title;
              if (title > 10)
                title = title.substring(0, 10) + "...";
              const message = "Remainder for '" + title + "'";
              //Show toast to the user
              this.showToast(message, 'remainder', false, note);
            }
          );
        }
      }
    );

    //Listener for pre notify remiander socket trigger, will be called 15 mins before the actual remainder time
    this.socketIo.consumeEventOnPreNotifyRemainder().subscribe(
      res => {
        //Check if this is an duplicate trigger
        const index = this.socketResponses.indexOf(res.resposneId);
        if (index == -1) {
          this.dataService.addSocketResponse(res.resposneId);
          this.notesService.getNoteDetails(res.remainder.noteId).subscribe(
            note => {
              //Frame toast message
              this.dataService.addLockNote(note.noteId);
              let title = note.title;
              if (title > 10)
                title = title.substring(0, 10) + "...";
              const message = "Remainder for '" + title + "'";
              //Show toast to the user
              this.showToast(message, 'preRemainder', false, note);
            }
          );
        }
      }
    );

    //Listener for note shared from other user socket trigger
    this.socketIo.consumeEventOnNoteShared().subscribe(
      res => {
        //Check if this is an duplicate trigger
        const index = this.socketResponses.indexOf(res.resposneId);
        if (index == -1) {
          this.dataService.addSocketResponse(res.resposneId);
          this.usersService.getUserDetails(res.parentUserId).subscribe(
            user => {
              //Frame toast message
              let userName = user.name.substr(0, 1).toUpperCase() + user.name.substr(1).toLowerCase();
              if (userName > 10)
                userName = userName.substring(0, 10) + "...";
              const message = userName + ' shared a note with you';
              //Show toast to the user
              this.showToast(message, 'share', true);
            },
            err => {
              console.log(err);
            }
          );
          this.notesService.updateNotes();
        }
      }
    );

    //Listener for note updated by parent or shared user
    this.socketIo.consumeEventOnSharedNoteEdited().subscribe(
      res => {
        this.notesService.updateNotes();
      }
    );
  }

  //Compare notes based on their createdOn time, to display the notes from recent to old
  compareNotes(noteA, noteB) {
    let comparison = 0;
    const momentA = moment(noteA.createdOn);
    const momentB = moment(noteB.createdOn)
    if (momentA > momentB) {
      comparison = -1;
    } else if (momentA < momentB) {
      comparison = 1;
    }
    return comparison;
  }

  //Toggle favorite property of a note
  onToggleFav(noteId) {
    this.notesService.toggleFavorite(noteId).subscribe(
      res => { },
      err => {
        console.log(err);
      }
    );
  }

  //Show toast message to the user, also logic to handle multiple toast triggers at the same time
  showToast(toastMessage, toastType, autoClose, toastData?) {
    //Create a recurring call
    const myInterval = setInterval(() => {
      //If no toast message in the screen
      if (this.toastStatus == 'reset') {
        //Open the toast message
        this.dataService.changeToastInput('open', toastType, toastMessage, toastData);
        //if autoclose is true, then close the toast messgae in 5 seconds
        if (autoClose) {
          setTimeout(() => {
            this.dataService.changeToastInput('close', toastType, toastMessage, toastData);
            //After clsoing the toast, makes the status again to reset
            setTimeout(() => {
              this.dataService.changeToastInput('reset');
            }, 1000);
          }, 5000);
        }
        clearInterval(myInterval);
      }
    }, 500);
  }

  onToastClose(data) {
    const action = data.action;
    const toastData = <Note>data.toastData;
    const toastType = data.toastType;
    //Close the toast message
    this.dataService.changeToastInput('close', toastType, data.toastMessage, toastData);
    //After clsoing the toast, makes the status again to reset
    setTimeout(() => {
      this.dataService.changeToastInput('reset');
    }, 1000);
    //If the toast type is remainder/pre-remainder then handle the user action passed
    if (toastType == 'remainder' || toastType == 'preRemainder') {
      this.dataService.removeLockNote(toastData.noteId);
      //When the user action is Dimiss
      if (action == 'Dismiss') {
        //Dismiss the remiander
        this.remaindersService.dismissRemainder(toastData).subscribe(
          res => { },
          err => {
            console.log(err);
          }
        );
        //When the user acton is snooze
      } else if (action == 'Snooze') {
        //Get the current remainder time
        this.remaindersService.getRemainder(toastData).subscribe(
          remainder => {
            //Add 5 minutes to the current remainder time
            const remainderDateTime = moment(remainder.remainderTime);
            const currentTimePlusFive = moment(new Date()).add(5, 'minutes');
            const intervalMinutes = currentTimePlusFive.diff(remainderDateTime, 'minutes').toString();
            //Update the new remiander time in database
            this.remaindersService.snoozeRemainder(toastData, intervalMinutes).subscribe(
              res => { },
              err => {
                console.log(err);
              }
            );
          },
          err => {
            console.log(err);
          }
        );
      }
    }
  }

}
