import { Component, OnInit, OnDestroy, effect } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { EtherService } from "../../../services/ether.service"
import { TransactionHistoryComponent } from "../transaction-history/transaction-history.component"
import { NetworkDisplayComponent } from "../../conection/network-display/network-display.component"
import { SendTransactionComponent } from "../send-transaction/send-transaction.component"
import { ContactsComponent } from "../contacts/contacts.component"
import { Network } from "../../../interfaces/network.interface"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TransactionHistoryComponent, 
    NetworkDisplayComponent, 
    SendTransactionComponent,
    ContactsComponent
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit, OnDestroy {
  isDarkMode = true
  userName = "Usuario"

  // Wallet state
  isWalletConnected = false
  walletAddress = ""
  balance = "0"
  networkName = ""
  networkSymbol = ""
  isRefreshingBalance = false

  // Send transaction modal
  showSendModal = false

  // Active view
  activeView: 'history' | 'contacts' | 'settings' = 'history'

  constructor(
    private router: Router,
    private etherService: EtherService,
  ) {
    // Use effects to react to signal changes
    effect(() => {
      this.isWalletConnected = this.etherService.isConnected()
      if (!this.isWalletConnected) {
        this.walletAddress = ""
        this.balance = "0"
        this.networkName = ""
      }
    })

    effect(() => {
      const account = this.etherService.currentAccount()
      this.walletAddress = account
      if (account) {
        this.userName = `${account.slice(0, 6)}...${account.slice(-4)}`
      }
    })

    effect(() => {
      this.balance = this.etherService.balance()
    })

    effect(() => {
      const network = this.etherService.network()
      this.networkName = network?.name || ""
      this.networkSymbol = network?.symbol || "ETH"
    })
  }

  ngOnInit(): void {
    // No need for subscriptions with signals
  }

  ngOnDestroy(): void {
    // No subscriptions to unsubscribe from
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode
  }

  async connectWallet(): Promise<void> {
    try {
      await this.etherService.connectWallet()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  async disconnectWallet(): Promise<void> {
    await this.etherService.disconnect()
  }

  openSendModal(): void {
    this.showSendModal = true
  }

  closeSendModal(): void {
    this.showSendModal = false
  }

  onTransactionSent(txHash: string): void {
    console.log("Transaction sent from component:", txHash)
    // You can add additional logic here, like showing a success notification
  }

  logout(): void {
    this.etherService.disconnect()
    this.router.navigate(["/introduction"])
  }

  onNetworkChanged(network: Network): void {
    // Handle network change event from network-display component
    console.log("Network changed to:", network)
    // You can add additional logic here if needed
  }

  // Método para refrescar el balance
  async refreshBalance(): Promise<void> {
    if (this.isRefreshingBalance || !this.isWalletConnected) return;
    
    this.isRefreshingBalance = true;
    try {
      // Actualizar el balance usando el servicio
      await this.etherService.updateBalanceEth();
    } catch (error) {
      console.error("Error refreshing balance:", error);
    } finally {
      // Esperar un momento para mostrar la animación
      setTimeout(() => {
        this.isRefreshingBalance = false;
      }, 500);
    }
  }

  // Métodos para cambiar la vista activa
  setActiveView(view: 'history' | 'contacts' | 'settings'): void {
    this.activeView = view;
  }

  get formattedBalance(): string {
    const bal = Number.parseFloat(this.balance)
    return bal.toFixed(4)
  }

  get formattedAddress(): string {
    if (!this.walletAddress) return ""
    return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  trackByHash(index: number, transaction: any): string {
    return transaction.hash
  }
}