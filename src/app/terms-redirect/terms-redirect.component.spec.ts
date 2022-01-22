import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsRedirectComponent } from './terms-redirect.component';

describe('TermsRedirectComponent', () => {
  let component: TermsRedirectComponent;
  let fixture: ComponentFixture<TermsRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
