import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Supabase } from '../../../../core/services/supabase/supabase';
import { PerfilUsuario } from '../../../../core/models/perfil-usuario';
import { Bienvenida } from '../../../bienvenida/bienvenida';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Bienvenida],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  cargando = false;
  intentoEnvio = false;
  mensajeError = '';
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,  // Inyección de FormBuilder para crear el formulario reactivo
    private supabase: Supabase, // Inyección del servicio de Supabase para manejar la autenticación
    private router: Router // Inyección del Router para navegar entre páginas
  ) {}

  ngOnInit(): void {
    // Inicializar el formulario con validaciones
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]], // Campo nombre, requerido y con longitud mínima de 2 caracteres
        apellido: ['', [Validators.required, Validators.minLength(2)]], // Campo apellido, requerido y con longitud mínima de 2 caracteres
        edad: ['', [Validators.required, Validators.min(13), Validators.max(99)]], // Campo edad, requerido y con valor mínimo de 13
        email: ['', [Validators.required, Validators.email]], // Campo email, requerido y con formato de email válido
        password: ['', [Validators.required, Validators.minLength(6)]], // Campo contraseña, requerido y con longitud mínima de 6 caracteres
    });
  }

  // Verifico que el mail ingresado no se encuentre ya registrado en la base de datos (evito dupeos)
  private async verificarEmailUnico(email: string): Promise<boolean> {
    const { data, error } = await this.supabase.obtenerPerfilPorEmail(email);

    if (error) {
      console.error('Error al verificar email:', error);
      return false; // En caso de error, asumo que el email no es único para evitar registros duplicados
    }

    return data === null; // Si no se encuentra un perfil con ese email, es único
  }


  // Método para manejar el envío del formulario de registro asyncronamente y con promesas para manejar la lógica de registro con Supabase
  async enviar(): Promise<void> {
    this.intentoEnvio = true;
    this.mensajeError = '';

    if (this.form.invalid) {
      this.mensajeError = 'Revisá los campos del formulario.';
      return;
    }

    this.cargando = true;

    const { nombre, apellido, edad, email, password } = this.form.value;

    try {
      const { data: dataRegistro, error: errorRegistro } = await this.supabase.registrar(email, password, {
        nombre,
        apellido,
        edad: Number(edad),
      });

      if (errorRegistro) {
        if (this.esEmailYaRegistrado(errorRegistro)) {
          this.form.get('email')!.setErrors({ yaRegistrado: true });
        } else {
          this.mensajeError = this.traducirErrorRegistro(errorRegistro);
        }
        return;
      }

      const perfil: PerfilUsuario = {
        email,
        nombre,
        apellido,
        edad: Number(edad),
      };

      if (dataRegistro?.session) {
        await this.supabase.upsertPerfil(perfil);
        await this.router.navigate(['/home']);
      } else {
        this.mensajeError = 'Registro exitoso. Revisá tu correo para confirmar la cuenta y luego iniciá sesión.';
      }
    } catch {
      this.mensajeError = 'Ocurrió un error inesperado. Intentá nuevamente.';
    } finally {
      this.cargando = false;
    }
  }

  private traducirErrorRegistro(error: { message?: string; status?: number; code?: string }): string {
    const texto = (error.message || '').toLowerCase();

    if (texto.includes('password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (texto.includes('invalid email')) {
      return 'El formato del email no es válido.';
    }

    return 'No se pudo crear la cuenta. Intentá nuevamente.';
  }

  private esEmailYaRegistrado(error: { message?: string; status?: number; code?: string }): boolean {
    const texto = (error.message || '').toLowerCase();
    return (
      error.status === 409 ||
      error.code === '23505' ||
      texto.includes('user already registered') ||
      texto.includes('duplicate key')
    );
  }
}
