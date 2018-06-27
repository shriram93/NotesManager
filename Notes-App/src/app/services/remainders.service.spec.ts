import { TestBed, inject } from '@angular/core/testing';

import { RemaindersService } from './remainders.service';

describe('RemaindersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemaindersService]
    });
  });

  it('should be created', inject([RemaindersService], (service: RemaindersService) => {
    expect(service).toBeTruthy();
  }));
});
