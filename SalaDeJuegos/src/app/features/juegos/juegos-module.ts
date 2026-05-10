import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { Ahorcado} from './pages/ahorcado/ahorcado';
import { BuscaMinas} from './pages/busca-minas/busca-minas';
import { MayorMenor } from './pages/mayor-menor/mayor-menor';
import { Preguntados } from './pages/preguntados/preguntados';
import { JuegosRoutingModule } from './juegos-routing-module';

@NgModule({
  declarations: [
    Ahorcado,
    BuscaMinas,
    MayorMenor,
    Preguntados
  ],
  imports: [CommonModule, JuegosRoutingModule],
})
export class JuegosModule {}
