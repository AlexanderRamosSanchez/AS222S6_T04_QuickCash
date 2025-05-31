import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.css",
})
export class RegisterComponent {
  @Input() showModal = false
  @Output() showModalChange = new EventEmitter<boolean>()
  @Output() switchToLogin = new EventEmitter<void>()

  // Register form data
  registerData = {
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  }
  registerErrorMessage = ""
  registerSuccessMessage = ""

  register(): void {
    // Limpiar mensajes previos
    this.registerErrorMessage = ""
    this.registerSuccessMessage = ""

    // Validaciones básicas
    if (
      !this.registerData.email ||
      !this.registerData.username ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {
      this.registerErrorMessage = "Todos los campos son obligatorios"
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.registerData.email)) {
      this.registerErrorMessage = "Por favor ingrese un correo electrónico válido"
      return
    }

    // Validar que el username no esté vacío y tenga al menos 3 caracteres
    if (this.registerData.username.length < 3) {
      this.registerErrorMessage = "El nombre de usuario debe tener al menos 3 caracteres"
      return
    }

    // Validar contraseñas
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.registerErrorMessage = "Las contraseñas no coinciden"
      return
    }

    if (this.registerData.password.length < 6) {
      this.registerErrorMessage = "La contraseña debe tener al menos 6 caracteres"
      return
    }

    // Aquí puedes agregar la lógica para enviar los datos al backend
    console.log("Datos de registro:", this.registerData)

    // Simulación de registro exitoso
    this.registerSuccessMessage = "Cuenta creada exitosamente. Ahora puedes iniciar sesión."

    // Limpiar formulario después de 2 segundos y cerrar modal
    setTimeout(() => {
      this.clearRegisterForm()
      this.closeModal()
      this.registerSuccessMessage = ""
    }, 2000)
  }

  closeModal(): void {
    this.showModal = false
    this.showModalChange.emit(false)
    this.clearRegisterForm()
  }

  clearRegisterForm(): void {
    this.registerData = {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    }
    this.registerErrorMessage = ""
    this.registerSuccessMessage = ""
  }

  onSwitchToLogin(): void {
    this.closeModal()
    this.switchToLogin.emit()
  }
}
