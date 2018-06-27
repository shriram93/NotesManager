import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteNoteDialogComponent } from './confirm-delete-note-dialog.component';

describe('ConfirmDeleteDialogComponent', () => {
  let component: ConfirmDeleteNoteDialogComponent;
  let fixture: ComponentFixture<ConfirmDeleteNoteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteNoteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteNoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
