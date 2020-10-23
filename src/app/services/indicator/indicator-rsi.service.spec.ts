import { TestBed } from '@angular/core/testing';

import { IndicatorRSIService } from './indicator-rsi.service';

describe('IndicatorRsiService', () => {
  let service: IndicatorRSIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicatorRSIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
