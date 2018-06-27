import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNoteToGroupDialogComponent } from './add-note-to-group-dialog.component';

describe('AddNoteToGroupDialogComponent', () => {
  let component: AddNoteToGroupDialogComponent;
  let fixture: ComponentFixture<AddNoteToGroupDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNoteToGroupDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNoteToGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
