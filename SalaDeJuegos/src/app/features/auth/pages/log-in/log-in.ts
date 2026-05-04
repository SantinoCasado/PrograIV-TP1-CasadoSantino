import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Supabase } from '../../../../core/services/supabase/supabase';
import { Bienvenida } from '../../../bienvenida/bienvenida';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Bienvenida],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn implements OnInit {
  cargando = false;
  intentoEnvio = false;
  mensajeError = '';
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,  
    private supabase: Supabase,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar el formulario con validaciones
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    const motivo = this.route.snapshot.queryParamMap.get('msg');

    if (motivo === 'requiere-login') {
      this.mensajeError = 'Debés iniciar sesión para acceder a esta página.';
    }
  }

  async enviar(): Promise<void> {
    this.intentoEnvio = true; // Marcar que se intentó enviar el formulario
    this.mensajeError = '';

    // Validar el formulario antes de enviar
    if (this.form.invalid) {
      this.mensajeError = 'Revisá los campos del formulario.';
      return;
    }

    this.cargando = true; // Indicar que se está procesando el inicio de sesión

    const email = (this.form.value.email ?? '').trim().toLowerCase();  // Obtener y normalizar email
    const password = this.form.value.password ?? '';  // Obtener la contraseña del formulario, asegurando que no sea null

    // Intentar iniciar sesión con Supabase
    try {
      const { error } = await this.supabase.iniciarSesion(email, password);

      if (error) {
        this.mensajeError = this.traducirErrorAuth(error.message);
        return;
      }

      await this.router.navigate(['/home']); // Navegar a la página de home después de iniciar sesión exitosamente
    } catch {
      this.mensajeError = 'No se pudo iniciar sesion. Intenta nuevamente.';
    } finally {
      this.cargando = false;
    }
  }

  // Método para iniciar sesión rápidamente con credenciales predefinidas (para pruebas)
  async loginRapido(email: string, password: string): Promise<void> {
    this.form.patchValue({ email, password });
    await this.enviar();
  }

  // Método para traducir mensajes de error de autenticación a mensajes amigables
  private traducirErrorAuth(mensaje: string): string {
    const texto = mensaje.toLowerCase();

    if (texto.includes('invalid login credentials')) {
      return 'Correo o contraseña incorrectos.';
    }

    if (texto.includes('email not confirmed') || texto.includes('email_not_confirmed')) {
      return 'Debés confirmar tu correo antes de iniciar sesión.';
    }

    return 'No se pudo iniciar sesión. Intentá nuevamente.';
  }
}
