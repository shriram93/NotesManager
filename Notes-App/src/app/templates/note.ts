export class Note {
  noteId: string;
  title: string;
  content: string;
  userId: string;
  groupId: string;
  modifiedOn: string;
  createdOn:string;
  favorite: boolean;
  parentNoteId: string;
  permission: string;
  sharedNotes: Array<{
    noteId: string,
    userId: string,
    permission: string
  }>;
  remainderId:string
  constructor() {
    this.noteId = '';
    this.userId = '';
    this.title = '';
    this.content = '';
    this.groupId = '';
    this.modifiedOn = '';
    this.parentNoteId = '';
    this.permission = '';
    this.sharedNotes =[];
    this.createdOn = '';
    this.favorite = false;
    this.remainderId = '';
  }
}