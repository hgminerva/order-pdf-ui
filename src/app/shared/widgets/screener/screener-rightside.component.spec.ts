import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenerRightsideComponent } from './screener-rightside.component';

describe('ScreenerComponent', () => {
  let component: ScreenerRightsideComponent;
  let fixture: ComponentFixture<ScreenerRightsideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenerRightsideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenerRightsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
