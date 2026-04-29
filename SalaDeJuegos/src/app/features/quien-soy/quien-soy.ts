import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  user: GithubUser | null = null;
  loading = false;
  error: string | null = null;

  githubUsername = 'SantinoCasado';

  constructor(
    private githubService: GithubService,

/*
Tenia un problema con la detección de cambios en Angular al usar el servicio de GitHub. 
Cuando el observable emitía un nuevo valor o un error, Angular no actualizaba la interfaz de 
usuario automáticamente. Al inyectar ChangeDetectorRef y llamar a detectChanges() 
después de actualizar los datos o manejar errores, pude forzar a Angular a detectar los cambios y 
actualizar la vista correctamente. Esto fue especialmente útil para mostrar mensajes de error o 
actualizar el perfil del usuario sin problemas.
    	            1ra vez	  2da vez
¿Llegó el dato?	  ✓ sí	    ✓ sí (de caché)
¿Angular lo vio?	✗ no	    ✓ sí
¿Se mostró?	      ✗ no	    ✓ sí

Explicacion de la IA:
ChangeDetectorRef se usa para forzar a Angular a detectar cambios después de que el observable emite un 
nuevo valor o un error, asegurando que la interfaz de usuario se actualice correctamente incluso si la 
suscripción ocurre fuera del ciclo de detección de Angular.
*/
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGitHubUser();
  }

  loadGitHubUser(): void {
    this.loading = true;
    this.error = null;
    this.user = null;

    this.githubService
      .getUser(this.githubUsername)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.user = data;
          this.loading = false;
          this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar el usuario
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
          this.cdr.detectChanges();
        },
      });
  }
}