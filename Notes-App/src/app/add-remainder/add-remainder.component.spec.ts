import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRemainderComponent } from './add-remainder.component';

describe('AddRemainderComponent', () => {
  let component: AddRemainderComponent;
  let fixture: ComponentFixture<AddRemainderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRemainderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRemainderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
