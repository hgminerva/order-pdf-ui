import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenerImportComponent } from './screener-import.component';

describe('ScreenerImportComponent', () => {
  let component: ScreenerImportComponent;
  let fixture: ComponentFixture<ScreenerImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenerImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenerImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
