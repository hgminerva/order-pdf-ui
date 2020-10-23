import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenerPdfComponent } from './screener-pdf.component';

describe('ScreenerPdfComponent', () => {
  let component: ScreenerPdfComponent;
  let fixture: ComponentFixture<ScreenerPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenerPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenerPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
