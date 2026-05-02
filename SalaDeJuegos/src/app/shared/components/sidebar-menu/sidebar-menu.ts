import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import { GithubUser } from '../../../core/models/github-user';
import { GithubService } from '../../../core/services/github/github';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css',
})
export class SidebarMenu implements OnInit {
  @Input() seccionActiva: 'home' | 'perfil' | 'tabla' | 'chat' | 'about' = 'home';
  @Input() githubUsername = 'SantinoCasado';
  @Input() linkedInUrl = 'https://www.linkedin.com/in/santino-casado-1841902aa/';

  user = signal<GithubUser | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  socialMenuAbierto = signal(false);

  constructor(private githubService: GithubService) {}

  ngOnInit(): void {
    this.cargarUsuarioGithub();
  }

  alternarSocialMenu(): void {
    this.socialMenuAbierto.update((estado) => !estado);
  }

  private cargarUsuarioGithub(): void {
    this.loading.set(true);
    this.error.set(null);

    this.githubService
      .getUser(this.githubUsername)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.user.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar GitHub.');
          this.loading.set(false);
        },
      });
  }
}
