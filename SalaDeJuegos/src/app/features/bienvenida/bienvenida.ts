import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Navbar } from '../../layouts/navbar/navbar';
import { Carousel } from '../../shared/components/carousel/carousel';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, Navbar, Carousel],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class Bienvenida {}
