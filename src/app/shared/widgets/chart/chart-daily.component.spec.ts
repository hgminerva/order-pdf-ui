import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDailyComponent } from './chart-daily.component';

describe('ChartDailyComponent', () => {
  let component: ChartDailyComponent;
  let fixture: ComponentFixture<ChartDailyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDailyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDailyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
