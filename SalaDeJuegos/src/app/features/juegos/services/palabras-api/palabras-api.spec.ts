import { TestBed } from '@angular/core/testing';

import { PalabrasApi } from './palabras-api';

describe('PalabrasApi', () => {
  let service: PalabrasApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PalabrasApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
