import { TestBed } from '@angular/core/testing';

import { IndicatorMSIService } from './indicator-msi.service';

describe('IndicatorMsiService', () => {
  let service: IndicatorMSIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicatorMSIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
