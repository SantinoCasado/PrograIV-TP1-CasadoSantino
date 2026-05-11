// Modelo del mensaje de chat utilizado en la aplicación
export interface MensajeChat {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  user_message: string;
  created_at: string;
}