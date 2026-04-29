import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { Navbar } from '../../layouts/navbar/navbar';
import { GithubService } from '../../core/services/github/github';
import { GithubUser } from '../../core/models/github-user';

@Component({
selector: 'app-quien-soy',
standalone: true,
imports: [CommonModule, RouterLink, Navbar],
templateUrl: './quien-soy.html',
styleUrl: './quien-soy.css',
})

export class QuienSoy implements OnInit {
  user = signal<GithubUser | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  githubUsername = 'SantinoCasado';

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.loadGitHubUser();
  }

  loadGitHubUser(): void {
    this.loading.set(true);
    this.error.set(null);
    this.user.set(null);

    this.githubService
      .getUser(this.githubUsername)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.user.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          if (err?.name === 'TimeoutError') {
            this.error.set('La solicitud tardó demasiado. Intentá nuevamente.');
          } else if (err?.status === 403) {
            this.error.set('Límite de la API de GitHub alcanzado. Intentá en unos minutos.');
          } else if (err?.status === 404) {
            this.error.set(`Usuario "${this.githubUsername}" no encontrado en GitHub.`);
          } else {
            this.error.set('No se pudo cargar el perfil de GitHub. Verificá tu conexión.');
          }
        },
      });
  }
}