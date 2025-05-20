// src/app/dapp/components/send-transaction/send-transaction.component.ts
import { Component, OnInit } from '@angular/core';
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
export class SendTransactionComponent implements OnInit {
  recipient: string = '';
  amount: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isProcessing: boolean = false;
  useContract: boolean = false;
  contractAddress: string = '0x9dC22Db88B2F1212DD2F2bD53aBE05bC7bCc4Baa'; // Dirección predeterminada
  
  // Nuevas propiedades para contactos
  contacts: Contact[] = [];
  selectedContactId: string = '';
  showAddContact: boolean = false;
  
  // Nuevas propiedades para el contrato
  isContractInitialized: boolean = false;
  contractBalance: string = '0';
  
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
  
  ngOnInit(): void {
    // No es necesario obtener contractAddress si ya está inicializado
    if (this.etherService.contractAddress()) {
      this.isContractInitialized = true;
      this.contractBalance = this.etherService.getContractBalanceFormatted();
    }
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
      this.newContact.address = this.recipient; // Pre-llenar dirección
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
    if (!this.newContact.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return;
    }
    
    if (this.contactService.nameExists(this.newContact.name)) {
      this.errorMessage = 'Ya existe un contacto con este nombre';
      return;
    }
    
    if (!ethers.utils.isAddress(this.newContact.address)) {
      this.errorMessage = 'La dirección no es válida';
      return;
    }
    
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

  async initializeContract(): Promise<void> {
    if (!ethers.utils.isAddress(this.contractAddress)) {
      this.errorMessage = 'La dirección del contrato no es válida';
      return;
    }
    
    this.isProcessing = true;
    try {
      const success = await this.etherService.initContract(this.contractAddress);
      if (success) {
        this.isContractInitialized = true;
        this.contractBalance = this.etherService.getContractBalanceFormatted();
        this.successMessage = 'Contrato inicializado correctamente';
      } else {
        this.errorMessage = 'Error al inicializar el contrato';
      }
    } catch (error) {
      console.error('Error al inicializar contrato:', error);
      this.errorMessage = 'Error al inicializar el contrato';
    } finally {
      this.isProcessing = false;
    }
  }

  async sendTransaction(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!ethers.utils.isAddress(this.recipient)) {
      this.errorMessage = 'La dirección del destinatario no es válida';
      return;
    }
    
    if (!this.amount || isNaN(Number(this.amount)) || Number(this.amount) <= 0) {
      this.errorMessage = 'Por favor ingresa un monto válido';
      return;
    }
    
    this.isProcessing = true;
    
    try {
      let txHash: string | null;
      
      if (this.useContract) {
        if (!this.contractAddress || !ethers.utils.isAddress(this.contractAddress)) {
          this.errorMessage = 'La dirección del contrato no es válida';
          this.isProcessing = false;
          return;
        }
        
        if (!this.isContractInitialized) {
          const initialized = await this.etherService.initContract(this.contractAddress);
          if (!initialized) {
            this.errorMessage = 'Error al inicializar el contrato';
            this.isProcessing = false;
            return;
          }
          this.isContractInitialized = true;
        }
        
        txHash = await this.etherService.sendContractTransaction(this.recipient, this.amount);
        this.contractBalance = this.etherService.getContractBalanceFormatted();
      } else {
        txHash = await this.etherService.sendTransaction(this.recipient, this.amount);
      }
      
      if (txHash) {
        this.successMessage = `¡Transacción enviada! Hash: ${txHash}`;
        this.amount = '';
        
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

  async depositToContract(): Promise<void> {
    if (!this.amount || isNaN(Number(this.amount)) || Number(this.amount) <= 0) {
      this.errorMessage = 'Por favor ingresa un monto válido';
      return;
    }

    if (!this.contractAddress || !ethers.utils.isAddress(this.contractAddress)) {
      this.errorMessage = 'La dirección del contrato no es válida';
      return;
    }

    if (!this.isContractInitialized) {
      const initialized = await this.etherService.initContract(this.contractAddress);
      if (!initialized) {
        this.errorMessage = 'Error al inicializar el contrato';
        return;
      }
      this.isContractInitialized = true;
    }

    this.isProcessing = true;
    try {
      const txHash = await this.etherService.depositToContract(this.amount);
      if (txHash) {
        this.successMessage = `¡Depósito realizado! Hash: ${txHash}`;
        this.amount = '';
        this.contractBalance = this.etherService.getContractBalanceFormatted();
      } else {
        this.errorMessage = 'Error al realizar el depósito';
      }
    } catch (error: unknown) {
      console.error('Error en el depósito:', error);
      if (error instanceof Error) {
        this.errorMessage = `Error al realizar el depósito: ${error.message}`;
      } else {
        this.errorMessage = 'Error al realizar el depósito: Error desconocido';
      }
    } finally {
      this.isProcessing = false;
    }
  }

  toggleContractUse(): void {
    this.useContract = !this.useContract;
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  shortenAddress(address: string): string {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }
}