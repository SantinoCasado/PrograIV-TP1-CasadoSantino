import { TestBed } from '@angular/core/testing';

import { PreguntadosApi } from './preguntados-api';

describe('PreguntadosApi', () => {
  let service: PreguntadosApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreguntadosApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
