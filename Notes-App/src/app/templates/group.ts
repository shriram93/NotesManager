import { Note } from "./note";

export class Group {
    groupId: string;
    title: string;
    description: string;
    userId: string;
    notes: Array<Note>;
    modifiedOn: string;
    constructor() {
        this.groupId = '';
        this.title = '';
        this.description = '';
        this.userId = '';
        this.modifiedOn = '';
        this.notes = [];
    }
}