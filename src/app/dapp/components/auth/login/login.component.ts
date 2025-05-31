import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  @Input() showModal = false
  @Output() showModalChange = new EventEmitter<boolean>()
  @Output() loginSuccess = new EventEmitter<void>()
  @Output() switchToRegister = new EventEmitter<void>()

  // Login form data
  username = ""
  password = ""
  errorMessage = ""

  login(): void {
    if (this.username && this.password) {
      if (this.username === "admin" && this.password === "admin") {
        this.closeModal()
        this.loginSuccess.emit()
        this.errorMessage = ""
      } else {
        this.errorMessage = "Nombre de usuario o contraseña incorrectos"
      }
    } else {
      this.errorMessage = "Por favor, introduce un nombre de usuario y contraseña"
    }
  }

  closeModal(): void {
    this.showModal = false
    this.showModalChange.emit(false)
    this.clearForm()
  }

  clearForm(): void {
    this.username = ""
    this.password = ""
    this.errorMessage = ""
  }

  onSwitchToRegister(): void {
    this.closeModal()
    this.switchToRegister.emit()
  }
}
