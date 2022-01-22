import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodsSelectComponent } from './foods-select.component';

describe('FoodsSelectComponent', () => {
  let component: FoodsSelectComponent;
  let fixture: ComponentFixture<FoodsSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodsSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
