import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Navbar } from '../../layouts/navbar/navbar';
import { GaleriaJuegosDisponibles } from '../../shared/components/galeria-juegos-disponibles/galeria-juegos-disponibles';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, Navbar, GaleriaJuegosDisponibles],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class Bienvenida {}