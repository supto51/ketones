import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeRedirectComponent } from './income-redirect.component';

describe('IncomeRedirectComponent', () => {
  let component: IncomeRedirectComponent;
  let fixture: ComponentFixture<IncomeRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
