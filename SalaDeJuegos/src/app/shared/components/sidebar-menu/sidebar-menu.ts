import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { Auth } from '../../../core/services/auth/auth';
import { GithubUser } from '../../../core/models/github-user';
import { GithubService } from '../../../core/services/github/github';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css',
})
export class SidebarMenu implements OnInit {
  @Input() seccionActiva: 'home' | 'perfil' | 'tabla' | 'chat' | 'about' | 'guia' = 'home';
  @Input() githubUsername = 'SantinoCasado';
  @Input() linkedInUrl = 'https://www.linkedin.com/in/santino-casado-1841902aa/';
  @Output() chatClickSinAuth = new EventEmitter<void>();

  protected auth = inject(Auth);
  private router = inject(Router);
  private githubService = inject(GithubService);

  user = signal<GithubUser | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  socialMenuAbierto = signal(false);
  bloqueoNoLogueoVisible = signal(false);

  constructor() {}

  ngOnInit(): void {
    this.cargarUsuarioGithub();
  }

  alternarSocialMenu(): void {
    this.socialMenuAbierto.update((estado) => !estado);
  }

  onChatClick(event: MouseEvent): void {
    if (!this.auth.usuario()) {
      event.preventDefault();
      this.chatClickSinAuth.emit();
    } else {
      this.router.navigate(['/chat']);
    }
  }

  onRutaProtegidaClick(event: MouseEvent, ruta: '/perfil' | '/tabla-general'): void {
    event.preventDefault();

    if (!this.auth.usuario()) {
      this.bloqueoNoLogueoVisible.set(true);
      return;
    }

    this.router.navigate([ruta]);
  }

  cerrarBloqueoNoLogueo(): void {
    this.bloqueoNoLogueoVisible.set(false);
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
