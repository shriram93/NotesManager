import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteGroupDialogComponent } from './confirm-delete-group-dialog.component';

describe('ConfirmDeleteGroupDialogComponent', () => {
  let component: ConfirmDeleteGroupDialogComponent;
  let fixture: ComponentFixture<ConfirmDeleteGroupDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteGroupDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
