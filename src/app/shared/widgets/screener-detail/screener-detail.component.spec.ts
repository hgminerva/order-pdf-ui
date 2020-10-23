import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenerDetailComponent } from './screener-detail.component';

describe('ScreenerDetailComponent', () => {
  let component: ScreenerDetailComponent;
  let fixture: ComponentFixture<ScreenerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenerDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
