// src/app/dapp/components/contacts/contacts.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../interfaces/contact.interface';
import { ethers } from 'ethers';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  showAddForm = false;
  showEditForm = false;
  
  newContact = {
    name: '',
    address: '',
    notes: ''
  };
  
  editingContact: Contact | null = null;
  searchTerm: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  
  constructor(public contactService: ContactService) {}
  
  ngOnInit(): void {
    this.loadContacts();
  }
  
  loadContacts(): void {
    this.contacts = this.contactService.getContacts();
  }
  
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.resetMessages();
    
    if (!this.showAddForm) {
      this.resetNewContact();
    }
  }
  
  resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  resetNewContact(): void {
    this.newContact = {
      name: '',
      address: '',
      notes: ''
    };
  }
  
  addContact(): void {
    this.resetMessages();
    
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
    this.loadContacts();
    this.resetNewContact();
    setTimeout(() => this.toggleAddForm(), 1500);
  }
  
  startEdit(contact: Contact): void {
    this.resetMessages();
    this.editingContact = { ...contact };
    this.showEditForm = true;
  }
  
  cancelEdit(): void {
    this.showEditForm = false;
    this.editingContact = null;
    this.resetMessages();
  }
  
  saveEdit(): void {
    this.resetMessages();
    
    if (!this.editingContact) return;
    
    // Validar nombre
    if (!this.editingContact.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return;
    }
    
    // Validar que el nombre no exista (excepto para el mismo contacto)
    const nameExists = this.contacts.some(c => 
      c.id !== this.editingContact!.id && 
      c.name.toLowerCase() === this.editingContact!.name.toLowerCase()
    );
    
    if (nameExists) {
      this.errorMessage = 'Ya existe un contacto con este nombre';
      return;
    }
    
    // Validar dirección
    if (!ethers.utils.isAddress(this.editingContact.address)) {
      this.errorMessage = 'La dirección no es válida';
      return;
    }
    
    // Validar que la dirección no exista (excepto para el mismo contacto)
    const addressExists = this.contacts.some(c => 
      c.id !== this.editingContact!.id && 
      c.address.toLowerCase() === this.editingContact!.address.toLowerCase()
    );
    
    if (addressExists) {
      this.errorMessage = 'Ya existe un contacto con esta dirección';
      return;
    }
    
    const updated = this.contactService.updateContact(this.editingContact.id, {
      name: this.editingContact.name.trim(),
      address: this.editingContact.address,
      notes: this.editingContact.notes?.trim()
    });
    
    if (updated) {
      this.successMessage = 'Contacto actualizado correctamente';
      this.loadContacts();
      setTimeout(() => this.cancelEdit(), 1500);
    } else {
      this.errorMessage = 'Error al actualizar el contacto';
    }
  }
  
  deleteContact(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      const deleted = this.contactService.deleteContact(id);
      if (deleted) {
        this.successMessage = 'Contacto eliminado correctamente';
        this.loadContacts();
      } else {
        this.errorMessage = 'Error al eliminar el contacto';
      }
    }
  }
  
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        this.successMessage = 'Dirección copiada al portapapeles';
        setTimeout(() => this.resetMessages(), 1500);
      },
      () => {
        this.errorMessage = 'Error al copiar la dirección';
      }
    );
  }
  
  get filteredContacts(): Contact[] {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.contacts;
    
    return this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(term) || 
      contact.address.toLowerCase().includes(term) ||
      (contact.notes && contact.notes.toLowerCase().includes(term))
    );
  }
  
  shortenAddress(address: string): string {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }
}