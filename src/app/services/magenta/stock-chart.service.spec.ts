import { TestBed } from '@angular/core/testing';

import { StockChartService } from './stock-chart.service';

describe('StockChartService', () => {
  let service: StockChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
