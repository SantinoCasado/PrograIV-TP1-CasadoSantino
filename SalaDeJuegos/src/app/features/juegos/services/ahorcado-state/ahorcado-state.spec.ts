import { TestBed } from '@angular/core/testing';

import { AhorcadoState } from './ahorcado-state';

describe('AhorcadoState', () => {
  let service: AhorcadoState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AhorcadoState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
