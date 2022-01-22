import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundRedirectComponent } from './refund-redirect.component';

describe('RefundRedirectComponent', () => {
  let component: RefundRedirectComponent;
  let fixture: ComponentFixture<RefundRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
