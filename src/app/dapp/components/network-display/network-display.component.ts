import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtherService } from '../../services/ether.service';
import { NETWORKS } from '../../config/constants';
import { Network } from '../../interfaces/network.interface';

@Component({
  selector: 'app-network-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './network-display.component.html',
  styleUrls: ['./network-display.component.css']
})
export class NetworkDisplayComponent implements OnInit {
  showNetworkOptions = false;
  availableNetworks: Network[] = [];
  isNetworkSwitching = false;
  
  constructor(public etherService: EtherService) {}
  
  ngOnInit(): void {
    // Obtener todas las redes disponibles desde constants
    this.availableNetworks = Object.values(NETWORKS);
  }
  
  getNetworkColor(): string {
    const chainId = this.etherService.network()?.chainId;
    
    if (!chainId) return '#64748b'; // Default gray
    
    return this.getNetworkColorById(chainId);
  }
  
  getNetworkColorById(chainId: number): string {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return '#627eea';
      case 11155111: // Sepolia
        return '#fb542b';
      case 137: // Polygon
        return '#8247e5';
      case 80001: // Mumbai
        return '#a020f0';
      case 17000: // Holesky
        return '#28a745';
      default:
        return '#64748b'; // Default gray
    }
  }
  
  async switchNetwork(chainId: number): Promise<void> {
    if (this.isNetworkSwitching) return;
    
    this.isNetworkSwitching = true;
    
    try {
      // Mostrar un indicador de carga o mensaje de estado
      console.log(`Cambiando a la red con ID: ${chainId}...`);
      
      // Intentar cambiar la red a través del servicio
      const success = await this.etherService.switchNetwork(chainId);
      
      if (success) {
        // Ocultar opciones de red después del cambio
        this.showNetworkOptions = false;
        console.log(`Cambio de red exitoso a ${this.getNetworkNameById(chainId)}`);
      } else {
        console.error('No se pudo cambiar la red');
      }
    } catch (error) {
      console.error('Error al cambiar de red:', error);
    } finally {
      // Restablecer el estado de cambio de red
      this.isNetworkSwitching = false;
    }
  }
  
  getNetworkNameById(chainId: number): string {
    const network = this.availableNetworks.find(n => n.chainId === chainId);
    return network?.name || `Red ${chainId}`;
  }
}