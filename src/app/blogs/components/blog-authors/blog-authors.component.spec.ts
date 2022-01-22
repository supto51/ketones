import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogAuthorsComponent } from './blog-authors.component';

describe('BlogAuthorsComponent', () => {
  let component: BlogAuthorsComponent;
  let fixture: ComponentFixture<BlogAuthorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogAuthorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
