import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GithubService, GitHubUser } from '../../core/services/github/github';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy implements OnInit {
  user: GitHubUser | null = null;
  loading = true;
  error: string | null = null;

  githubUsername = 'SantinoCasado';

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.loadGitHubUser();
  }

  loadGitHubUser(): void {
    this.githubService
      .getUser(this.githubUsername)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (err) => {
          console.error('Error al cargar datos de GitHub:', err);
          if (err?.status === 403) {
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
