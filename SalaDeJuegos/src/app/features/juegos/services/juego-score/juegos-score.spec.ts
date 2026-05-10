import { TestBed } from '@angular/core/testing';

import { JuegosScore } from './juegos-score';

describe('JuegosScore', () => {
  let service: JuegosScore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JuegosScore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
