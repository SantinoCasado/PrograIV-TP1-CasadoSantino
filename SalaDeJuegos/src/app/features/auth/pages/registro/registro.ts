import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Supabase } from '../../../../core/services/supabase/supabase';
import { PerfilUsuario } from '../../../../core/models/perfil-usuario';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
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

  // Método para manejar el envío del formulario de registro asyncronamente y con promesas para manejar la lógica de registro con Supabase
  async enviar(): Promise<void> {
    this.intentoEnvio = true; // Marcar que se intentó enviar el formulario
    this.mensajeError = ''; // Limpiar cualquier mensaje de error previo
    
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
      const {error: errorRegistro} = await this.supabase.registrar(email, password);
      
      if (errorRegistro) {
        // Traducir el mensaje de error de Supabase a un mensaje amigable
        this.mensajeError = this.traducirErrorRegistro(errorRegistro.message); 
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
      await this.supabase.guardarPerfil(perfil); 

      // Iniciar sesión automáticamente después de registrarse
      const { error: errorLogin} = await this.supabase.iniciarSesion(email, password);

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

  private traducirErrorRegistro(mensaje: string): string {
    const texto = mensaje.toLowerCase();

    if (texto.includes('user already registered')) {
      return 'Este correo ya se encuentra registrado.';
    }

    if (texto.includes('password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    return 'No se pudo crear la cuenta. Intentá nuevamente.';
  }
}
