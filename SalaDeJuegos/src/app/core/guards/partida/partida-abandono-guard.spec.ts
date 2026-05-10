import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';
import { PartidaAbandonable } from '../../interfaces/partida-abandonable';
import { partidaAbandonoGuard } from './partida-abandono-guard';

describe('partidaAbandonoGuard', () => {
  const executeGuard: CanDeactivateFn<PartidaAbandonable> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => partidaAbandonoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow deactivation when no game is in progress', async () => {
    const component: PartidaAbandonable = {
      hayPartidaEnCurso: () => false,
      pedirConfirmacionAbandono: () => Promise.resolve(true),
    };
    const result = await TestBed.runInInjectionContext(() =>
      partidaAbandonoGuard(component, null as any, null as any, null as any)
    );
    expect(result).toBe(true);
  });

  it('should delegate to component when game is in progress', async () => {
    const component: PartidaAbandonable = {
      hayPartidaEnCurso: () => true,
      pedirConfirmacionAbandono: () => Promise.resolve(false),
    };
    const result = await TestBed.runInInjectionContext(() =>
      partidaAbandonoGuard(component, null as any, null as any, null as any)
    );
    expect(result).toBe(false);
  });
});
