import { TestBed } from '@angular/core/testing';

import { CartasApi } from './cartas-api';

describe('CartasApi', () => {
  let service: CartasApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartasApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
