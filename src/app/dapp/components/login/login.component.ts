import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { EtherService } from "../../services/ether.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  username = ""
  password = ""
  errorMessage = ""
  
  // Define modal state with a single string variable
  modalState: 'closed' | 'wallet-options' | 'ethereum-wallets' | 'connecting-metamask' = 'closed'
  
  selectedWalletType: string | null = null
  selectedWallet: string | null = null
  isConnecting = false

  constructor(
    private authService: AuthService,
    private etherService: EtherService,
    private router: Router,
  ) {}

  // Computed properties for backward compatibility
  get showWalletOptions(): boolean {
    return this.modalState === 'wallet-options' || 
           this.modalState === 'ethereum-wallets' || 
           this.modalState === 'connecting-metamask';
  }

  get showEthereumWallets(): boolean {
    return this.modalState === 'ethereum-wallets';
  }

  navigateToIntro(): void {
    this.router.navigate(["/intro"]);
  }

  login(): void {
    if (this.username && this.password) {
      const success = this.authService.login(this.username, this.password)
      if (success) {
        this.modalState = 'wallet-options';
      } else {
        this.errorMessage = "Nombre de usuario o contraseña incorrectos"
      }
    } else {
      this.errorMessage = "Por favor, introduce un nombre de usuario y contraseña"
    }
  }

  selectWalletType(type: string): void {
    this.selectedWalletType = type
    if (type === "ethereum") {
      this.modalState = 'ethereum-wallets';
    }
  }

  selectWallet(wallet: string): void {
    this.selectedWallet = wallet
    if (wallet === "metamask") {
      this.connectMetaMask()
    }
  }

  async connectMetaMask(): Promise<void> {
    this.isConnecting = true
    this.modalState = 'connecting-metamask';
    
    try {
      const connected = await this.etherService.connectWallet()
      if (connected) {
        this.router.navigate(["/dashboard"])
      } else {
        this.errorMessage = "No se pudo conectar a MetaMask"
        this.isConnecting = false
      }
    } catch (error) {
      console.error("Error al conectar con MetaMask:", error)
      this.errorMessage = "Error al conectar con MetaMask"
      this.isConnecting = false
    }
  }

  continueWithoutWallet(): void {
    this.router.navigate(["/dashboard"])
  }

  closeWalletOptions(): void {
    this.modalState = 'closed';
    this.selectedWalletType = null
    this.selectedWallet = null
    this.isConnecting = false;
    this.errorMessage = "";
  }

  backToWalletTypes(): void {
    this.modalState = 'wallet-options';
    this.selectedWalletType = null;
  }

  getNetworkName(): string {
    return this.etherService.getNetworkName()
  }

  isConnected(): boolean {
    return this.etherService.isConnected()
  }
}