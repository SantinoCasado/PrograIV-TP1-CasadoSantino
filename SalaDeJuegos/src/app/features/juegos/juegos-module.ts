import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Ahorcado} from './pages/ahorcado/ahorcado';
import { BuscaMinas} from './pages/busca-minas/busca-minas';
import { MayorMenor } from './pages/mayor-menor/mayor-menor';
import { Preguntados } from './pages/preguntados/preguntados';
import { JuegosRoutingModule } from './juegos-routing-module';
import { TimerBarComponent } from '../../shared/components/timer-bar/timer-bar.component';

@NgModule({
  declarations: [
    Ahorcado,
    BuscaMinas,
    MayorMenor,
    Preguntados,
  ],
  imports: [CommonModule, JuegosRoutingModule, TimerBarComponent],
})
export class JuegosModule {}
