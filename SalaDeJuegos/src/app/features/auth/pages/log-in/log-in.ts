import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

    const email = this.form.value.email ?? '';  // Obtener el email del formulario, asegurando que no sea null
    const password = this.form.value.password ?? '';  // Obtener la contraseña del formulario, asegurando que no sea null

    // Intentar iniciar sesión con Supabase
    try {
      const { error } = await this.supabase.iniciarSesion(email, password);

      if (error) {
        this.mensajeError = this.traducirErrorAuth(error.message);
        return;
      }

      await this.router.navigate(['/about-me']);
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
      return 'Correo o contrasena incorrectos.';
    }

    if (texto.includes('email not confirmed')) {
      return 'Debes confirmar tu correo antes de iniciar sesion.';
    }

    return 'Ocurrio un error al iniciar sesion.';
  }
}
