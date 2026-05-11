import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaJuegos } from './guia-juegos';

describe('GuiaJuegos', () => {
  let component: GuiaJuegos;
  let fixture: ComponentFixture<GuiaJuegos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiaJuegos],
    }).compileComponents();

    fixture = TestBed.createComponent(GuiaJuegos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
