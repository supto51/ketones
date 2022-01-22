import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyRedirectComponent } from './privacy-redirect.component';

describe('PrivacyRedirectComponent', () => {
  let component: PrivacyRedirectComponent;
  let fixture: ComponentFixture<PrivacyRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
