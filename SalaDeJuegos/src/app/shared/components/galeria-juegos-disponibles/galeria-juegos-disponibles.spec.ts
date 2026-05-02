import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaleriaJuegosDisponibles } from './galeria-juegos-disponibles';

describe('GaleriaJuegosDisponibles', () => {
  let component: GaleriaJuegosDisponibles;
  let fixture: ComponentFixture<GaleriaJuegosDisponibles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaleriaJuegosDisponibles],
    }).compileComponents();

    fixture = TestBed.createComponent(GaleriaJuegosDisponibles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
