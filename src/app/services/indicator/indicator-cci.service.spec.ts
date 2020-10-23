import { TestBed } from '@angular/core/testing';

import { IndicatorCCIService } from './indicator-cci.service';

describe('IndicatorCciService', () => {
  let service: IndicatorCciService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicatorCCIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
