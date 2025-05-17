// src/app/dapp/components/wallet/wallet.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EtherService } from '../../services/ether.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  isMetaMaskInstalled: boolean = false;
  isConnecting: boolean = false;
  errorMessage: string = '';

  constructor(
    public etherService: EtherService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.checkMetaMaskInstallation();
  }

  private checkMetaMaskInstallation(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMetaMaskInstalled = window.ethereum && window.ethereum.isMetaMask;
    } else {
      this.isMetaMaskInstalled = false; // O manejarlo de otra forma si es necesario
    }
  }

  async connectMetaMask(): Promise<void> {
    this.isConnecting = true;
    this.errorMessage = '';
    
    try {
      const connected = await this.etherService.connectWallet();
      if (connected) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'No se pudo conectar a MetaMask';
      }
    } catch (error) {
      console.error('Error al conectar con MetaMask:', error);
      this.errorMessage = 'Error al conectar con MetaMask';
    } finally {
      this.isConnecting = false;
    }
  }

  installMetaMask(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open('https://metamask.io/download.html', '_blank');
    }
  }
}
