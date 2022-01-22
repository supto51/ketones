import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProceduresRedirectComponent } from './procedures-redirect.component';

describe('PolicyRedirectComponent', () => {
  let component: ProceduresRedirectComponent;
  let fixture: ComponentFixture<ProceduresRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProceduresRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProceduresRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
