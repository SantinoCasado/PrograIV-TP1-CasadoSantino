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
  form!: FormGroup; // Definición del formulario como una propiedad de la clase

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
    this.intentoEnvio = true; // Marcar que se intentó enviar el formulario
    this.mensajeError = ''; // Limpiar cualquier mensaje de error previo
    this.limpiarErrorEmailYaRegistrado();
    
    // Validar el formulario antes de enviar
    if (this.form.invalid) {
      this.mensajeError = 'Revisá los campos del formulario.'; 
      return;
    }

    this.cargando = true; // Indicar que se está procesando el registro

    const {nombre, apellido, edad, email, password} = this.form.value; // Desestructurar los valores del formulario

    // Intentar registrar al usuario con Supabase
    try {
      // Llamar al método de registro del servicio de Supabase
      const { error: errorRegistro } = await this.supabase.registrar(email, password);
      
      if (errorRegistro) {
        if (this.esEmailYaRegistrado(errorRegistro)) {
          this.form.get('email')!.setErrors({ yaRegistrado: true });
        } else {
          this.mensajeError = this.traducirErrorRegistro(errorRegistro);
        }
        return;
      }

      // Crear un perfil de usuario con los datos adicionales (nombre, apellido, edad)
      const perfil: PerfilUsuario = {
        email,
        nombre,
        apellido,
        edad: Number(edad), // Convertir edad a número
      };

      // Guardar el perfil en la base de datos
      const { error: errorPerfil } = await this.supabase.guardarPerfil(perfil);
      if (errorPerfil) {
        if (this.esEmailYaRegistrado(errorPerfil)) {
          this.form.get('email')!.setErrors({ yaRegistrado: true });
        } else {
          this.mensajeError = 'No se pudo guardar tu perfil. Intentá nuevamente.';
        }
        return;
      }

      // Iniciar sesión automáticamente después de registrarse
      const { error: errorLogin} = await this.supabase.iniciarSesion(email, password);
      
      // Si ocurre un error al iniciar sesión automáticamente, mostrar un mensaje pero permitir que el usuario inicie sesión manualmente después de registrarse exitosamente
      if (errorLogin) {
        this.mensajeError = 'Registro exitoso, pero no se pudo iniciar sesión automáticamente. Por favor, intentá iniciar sesión manualmente.';
        return;
      }      
      // Navegar a la página de inicio después de un registro exitoso
      await this.router.navigate(['/about-me']); 
    } catch {
      this.mensajeError = 'Ocurrió un error inesperado. Intenta nuevamente.';
    }finally {
      this.cargando = false; // Indicar que se ha terminado el proceso de registro
    }
  }

  private traducirErrorRegistro(error: { message?: string; status?: number; code?: string }): string {
    const texto = (error.message || '').toLowerCase();

    if (error.status === 429 || texto.includes('email rate limit') || texto.includes('too many requests')) {
      return 'Demasiados intentos seguidos. Esperá un minuto e intentá nuevamente.';
    }

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

  private limpiarErrorEmailYaRegistrado(): void {
    const controlEmail = this.form.get('email');
    if (!controlEmail?.errors?.['yaRegistrado']) {
      return;
    }

    const erroresActuales = { ...controlEmail.errors };
    delete erroresActuales['yaRegistrado'];
    controlEmail.setErrors(Object.keys(erroresActuales).length ? erroresActuales : null);
  }
}
