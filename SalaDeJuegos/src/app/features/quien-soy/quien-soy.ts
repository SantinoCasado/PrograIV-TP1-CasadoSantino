import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
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
  user: GithubUser | null = null;
  loading = true;
  error: string | null = null;

  githubUsername = 'SantinoCasado';

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.loadGitHubUser();
  }

  loadGitHubUser(): void {
    this.loading = true;
    this.error = null;
    this.user = null;

    // Failsafe UI: evita spinner infinito si la request queda colgada.
    const watchdog = setTimeout(() => {
      if (this.loading) {
        this.error = 'La solicitud está tardando demasiado. Intentá nuevamente.';
        this.loading = false;
      }
    }, 10000);

    this.githubService
      .getUser(this.githubUsername)
      .pipe(
        take(1),
        finalize(() => {
          clearTimeout(watchdog);
          this.loading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.user = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          if (err?.name === 'TimeoutError') {
            this.error = 'La solicitud tardó demasiado. Intentá nuevamente.';
          } else if (err?.status === 403) {
            this.error = 'Límite de la API de GitHub alcanzado. Intentá en unos minutos.';
          } else if (err?.status === 404) {
            this.error = `Usuario "${this.githubUsername}" no encontrado en GitHub.`;
          } else {
          this.error = 'No se pudo cargar el perfil de GitHub. Verificá tu conexión.';
          }
        },
      });
  }
}