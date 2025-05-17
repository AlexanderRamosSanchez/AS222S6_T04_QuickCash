// src/app/dapp/components/send-transaction/send-transaction.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtherService } from '../../services/ether.service';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../interfaces/contact.interface';
import { ethers } from 'ethers';

@Component({
  selector: 'app-send-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-transaction.component.html',
  styleUrls: ['./send-transaction.component.css']
})
export class SendTransactionComponent {
  recipient: string = '';
  amount: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isProcessing: boolean = false;
  useContract: boolean = false;
  contractAddress: string = '';
  
  // Nuevas propiedades para contactos
  contacts: Contact[] = [];
  selectedContactId: string = '';
  showAddContact: boolean = false;
  
  newContact = {
    name: '',
    address: '',
    notes: ''
  };
  
  constructor(
    public etherService: EtherService,
    public contactService: ContactService
  ) {
    this.loadContacts();
  }
  
  loadContacts(): void {
    this.contacts = this.contactService.getContacts();
  }
  
  selectContact(contactId: string): void {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      this.recipient = contact.address;
      this.selectedContactId = contactId;
    }
  }
  
  toggleAddContact(): void {
    this.showAddContact = !this.showAddContact;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.showAddContact) {
      this.resetNewContact();
    } else if (this.recipient && ethers.utils.isAddress(this.recipient)) {
      // Si hay una dirección válida en el campo de destinatario, 
      // la usamos para pre-llenar el formulario de contacto
      this.newContact.address = this.recipient;
    }
  }
  
  resetNewContact(): void {
    this.newContact = {
      name: '',
      address: '',
      notes: ''
    };
  }
  
  addContact(): void {
    // Validar nombre
    if (!this.newContact.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return;
    }
    
    // Validar que el nombre no exista
    if (this.contactService.nameExists(this.newContact.name)) {
      this.errorMessage = 'Ya existe un contacto con este nombre';
      return;
    }
    
    // Validar dirección
    if (!ethers.utils.isAddress(this.newContact.address)) {
      this.errorMessage = 'La dirección no es válida';
      return;
    }
    
    // Validar que la dirección no exista
    if (this.contactService.addressExists(this.newContact.address)) {
      this.errorMessage = 'Ya existe un contacto con esta dirección';
      return;
    }
    
    const contact = this.contactService.addContact({
      name: this.newContact.name.trim(),
      address: this.newContact.address,
      notes: this.newContact.notes.trim()
    });
    
    this.successMessage = `Contacto ${contact.name} añadido correctamente`;
    this.recipient = contact.address;
    this.loadContacts();
    this.selectedContactId = contact.id;
    this.resetNewContact();
    this.showAddContact = false;
  }

  async sendTransaction(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validar dirección del destinatario
    if (!ethers.utils.isAddress(this.recipient)) {
      this.errorMessage = 'La dirección del destinatario no es válida';
      return;
    }
    
    // Validar monto
    if (!this.amount || isNaN(Number(this.amount)) || Number(this.amount) <= 0) {
      this.errorMessage = 'Por favor ingresa un monto válido';
      return;
    }
    
    this.isProcessing = true;
    
    try {
      let txHash: string | null;
      
      if (this.useContract) {
        // Verificar si hay una dirección de contrato
        if (!this.contractAddress || !ethers.utils.isAddress(this.contractAddress)) {
          this.errorMessage = 'La dirección del contrato no es válida';
          this.isProcessing = false;
          return;
        }
        
        // Inicializar el contrato si es necesario
        await this.etherService.initContract(this.contractAddress);
        
        // Enviar transacción a través del contrato
        txHash = await this.etherService.sendContractTransaction(this.recipient, this.amount);
      } else {
        // Enviar transacción directa
        txHash = await this.etherService.sendTransaction(this.recipient, this.amount);
      }
      
      if (txHash) {
        this.successMessage = `¡Transacción enviada! Hash: ${txHash}`;
        this.amount = '';
        // No reseteamos el recipient para facilitar transacciones repetidas
        
        // Si es una dirección que no está en la lista de contactos, 
        // sugerir añadirla como contacto
        if (!this.contactService.addressExists(this.recipient)) {
          const addContact = confirm('¿Deseas guardar esta dirección como un nuevo contacto?');
          if (addContact) {
            this.toggleAddContact();
          }
        }
      } else {
        this.errorMessage = 'Error al enviar la transacción';
      }
    } catch (error: unknown) {
      console.error('Error en la transacción:', error);
      if (error instanceof Error) {
        this.errorMessage = `Error al enviar la transacción: ${error.message}`;
      } else {
        this.errorMessage = 'Error al enviar la transacción: Error desconocido';
      }
    } finally {
      this.isProcessing = false;
    }
  }

  toggleContractUse(): void {
    this.useContract = !this.useContract;
    this.errorMessage = '';
  }
  
  shortenAddress(address: string): string {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }
}
