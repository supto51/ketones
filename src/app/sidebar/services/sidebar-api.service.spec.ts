import { TestBed } from '@angular/core/testing';

import { SidebarApiService } from './sidebar-api.service';

describe('SidebarApiService', () => {
  let service: SidebarApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
