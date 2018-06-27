# Notes

App to create,edit and manage notes

## Frontend

Run `ng serve` from Notes-App directory and  Navigate to `http://localhost:4200/`

**Framework** <br />
Angular 6

## Backend

Run `npm start` from Notes-Server directory

**Technology** <br />
Nodejs, Express, MongoDB, Mongoose ,Sokcet.io

**API Documentation** <br />
After starting the server, Navigate to `http://localhost:3000/api-docs/` to view API documentation

**UTC** <br />
Run `npm test` to run unit test cases of API server

## Finished

* Add a new note and delete
* Create and delete group 
* Add and remove note from a group
* Mark note as favorite
* List all notes of a user or a particular group
* Do delete, mark as favorite/unfavorite, add to a group operation with multiple note
* Register a new user, Login/Logout funcitonality
* Sharing note
    * User can share note with other user/users
    * Unshare the shared note
    * Use socket connection to update the shared note in real time
    * Show toast for the user when someone share a note with them
    * Handle deletion of shared/parent note
    * Emit events when parent/shared user edit or delete a note   
* Search notes by title
* Remainder
    * Create and delete remainder for a note
    * Notify the user at the exact remainder time without page refresh
    * Notify users 15 mins before the remainder without page refresh
    * User can dismiss/snooze the remiander for 5 mins
    * Handle multiple remiander at the same time for the same user
* Create a custom toast dialog box since angular default snackbar can have only one button

## Data model
### Note
* noteId: String
* userId: String
* permission: String
* title: String
* content: String
* sharedNotes: Array <
    * noteId: String
    * userId: String
    * permission: String >
* parentNoteId: String
* groupId: String
* favorite: Boolean
* createdOn: Date
* modifiedOn: Date

### Group
* groupId:String
* userId: String
* title String
* description: String
* createdOn: Date
* modifiedOn: Date
* notes: Array<String>

## User
* userId: String
* name: String
* email: String
* password: String
    
## Remainder
* remainderId: String
* userId: String
* noteId: String
* remainderTime: Date
* isDismissed: Boolean
* createdOn: Date



