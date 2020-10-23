import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSeasonalityComponent } from './chart-seasonality.component';

describe('ChartSeasonalityComponent', () => {
  let component: ChartSeasonalityComponent;
  let fixture: ComponentFixture<ChartSeasonalityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSeasonalityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSeasonalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
