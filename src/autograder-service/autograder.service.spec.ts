import { TestBed } from '@angular/core/testing';

import { AutograderService } from './autograder.service';

describe('AutograderService', () => {
  let service: AutograderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutograderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
