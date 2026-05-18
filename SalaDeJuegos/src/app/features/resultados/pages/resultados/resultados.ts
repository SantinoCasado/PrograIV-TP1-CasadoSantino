import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultados',
  standalone: true,
  template: '',
})
export class Resultados implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Redirect a /perfil
    this.router.navigate(['/perfil']);
  }
}


