import { Component, EventEmitter, Input, Output, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { EtherService } from "../../../services/ether.service";

@Component({
  selector: "app-wallet",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./wallet.component.html",
  styleUrl: "./wallet.component.css",
})
export class WalletComponent {
  // Modal states
  @Input() modalState: "closed" | "wallet-options" | "ethereum-wallets" | "connecting-metamask" = "closed";
  @Input() isDarkMode = true;
  @Output() modalStateChange = new EventEmitter<"closed" | "wallet-options" | "ethereum-wallets" | "connecting-metamask">();
  
  // Wallet connection states
  selectedWalletType: string | null = null;
  selectedWallet: string | null = null;
  isConnecting = false;
  errorMessage = "";
  
  // Ethereum connection state
  isWalletConnected = false;
  walletAddress = "";
  networkName = "";
  
  constructor(
    private router: Router,
    private etherService: EtherService,
  ) {
    // Use effects to react to signal changes
    effect(() => {
      this.isWalletConnected = this.etherService.isConnected();
    });

    effect(() => {
      this.walletAddress = this.etherService.currentAccount();
    });

    effect(() => {
      const network = this.etherService.network();
      this.networkName = network?.name || "";
    });
  }
  
  selectWalletType(type: string): void {
    this.selectedWalletType = type;
    if (type === "ethereum") {
      this.updateModalState("ethereum-wallets");
    }
  }

  selectWallet(wallet: string): void {
    this.selectedWallet = wallet;
    if (wallet === "metamask") {
      this.connectMetaMask();
    }
  }

  async connectMetaMask(): Promise<void> {
    this.isConnecting = true;
    this.updateModalState("connecting-metamask");
    this.errorMessage = "";

    try {
      const connected = await this.etherService.connectWallet();

      if (connected) {
        setTimeout(() => {
          this.router.navigate(["/dashboard"]);
        }, 1000);
      } else {
        this.errorMessage = "No se pudo conectar con MetaMask";
        this.isConnecting = false;
      }
    } catch (error) {
      console.error("Error al conectar con MetaMask:", error);
      this.errorMessage = "Error al conectar con MetaMask. Asegúrate de tener MetaMask instalado.";
      this.isConnecting = false;
    }
  }

  continueWithoutWallet(): void {
    this.router.navigate(["/dashboard"]);
  }

  closeWalletOptions(): void {
    this.updateModalState("closed");
    this.selectedWalletType = null;
    this.selectedWallet = null;
    this.isConnecting = false;
    this.errorMessage = "";
  }

  backToWalletTypes(): void {
    this.updateModalState("wallet-options");
    this.selectedWalletType = null;
  }
  
  private updateModalState(state: "closed" | "wallet-options" | "ethereum-wallets" | "connecting-metamask"): void {
    this.modalState = state;
    this.modalStateChange.emit(state);
  }

  get showWalletOptions(): boolean {
    return (
      this.modalState === "wallet-options" ||
      this.modalState === "ethereum-wallets" ||
      this.modalState === "connecting-metamask"
    );
  }

  get showEthereumWallets(): boolean {
    return this.modalState === "ethereum-wallets";
  }

  get isMetaMaskAvailable(): boolean {
    return typeof window !== "undefined" && !!window.ethereum;
  }
}