import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../interfaces/contact.interface';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnInit {
  @Input() isDarkMode = true;
  
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm = '';
  
  showAddContact = false;
  isEditing = false;
  currentContact: Contact | null = null;
  
  newContact = {
    name: '',
    address: '',
    notes: ''
  };
  
  error = '';
  success = '';

  constructor() {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    const savedContacts = localStorage.getItem('quickcash_contacts');
    if (savedContacts) {
      this.contacts = JSON.parse(savedContacts);
      this.filteredContacts = [...this.contacts];
    }
  }

  saveContacts(): void {
    localStorage.setItem('quickcash_contacts', JSON.stringify(this.contacts));
  }

  searchContacts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(term) || 
      contact.address.toLowerCase().includes(term) ||
      (contact.notes && contact.notes.toLowerCase().includes(term))
    );
  }

  toggleAddContact(): void {
    this.showAddContact = !this.showAddContact;
    this.isEditing = false;
    this.error = '';
    this.success = '';
    this.resetNewContact();
  }

  editContact(contact: Contact): void {
    this.showAddContact = true;
    this.isEditing = true;
    this.currentContact = contact;
    this.newContact = {
      name: contact.name,
      address: contact.address,
      notes: contact.notes || ''
    };
    this.error = '';
    this.success = '';
  }

  resetNewContact(): void {
    this.newContact = {
      name: '',
      address: '',
      notes: ''
    };
    this.currentContact = null;
  }

  addOrUpdateContact(): void {
    if (!this.newContact.name.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    
    if (!this.isValidAddress(this.newContact.address)) {
      this.error = 'La dirección no es válida';
      return;
    }
    
    if (this.isEditing && this.currentContact) {
      // Actualizar contacto existente
      const index = this.contacts.findIndex(c => c.id === this.currentContact!.id);
      if (index !== -1) {
        // Verificar si el nombre ya existe en otro contacto
        const nameExists = this.contacts.some(c => 
          c.id !== this.currentContact!.id && 
          c.name.toLowerCase() === this.newContact.name.toLowerCase()
        );
        
        if (nameExists) {
          this.error = 'Ya existe un contacto con este nombre';
          return;
        }
        
        // Verificar si la dirección ya existe en otro contacto
        const addressExists = this.contacts.some(c => 
          c.id !== this.currentContact!.id && 
          c.address.toLowerCase() === this.newContact.address.toLowerCase()
        );
        
        if (addressExists) {
          this.error = 'Ya existe un contacto con esta dirección';
          return;
        }
        
        this.contacts[index] = {
          ...this.currentContact,
          name: this.newContact.name.trim(),
          address: this.newContact.address,
          notes: this.newContact.notes.trim()
        };
        
        this.saveContacts();
        this.success = `Contacto ${this.newContact.name} actualizado correctamente`;
      }
    } else {
      // Verificar si el nombre ya existe
      if (this.contacts.some(c => c.name.toLowerCase() === this.newContact.name.toLowerCase())) {
        this.error = 'Ya existe un contacto con este nombre';
        return;
      }
      
      // Verificar si la dirección ya existe
      if (this.contacts.some(c => c.address.toLowerCase() === this.newContact.address.toLowerCase())) {
        this.error = 'Ya existe un contacto con esta dirección';
        return;
      }
      
      // Crear nuevo contacto
      const newContact: Contact = {
        id: Date.now().toString(),
        name: this.newContact.name.trim(),
        address: this.newContact.address,
        notes: this.newContact.notes.trim(),
        createdAt: new Date()
      };
      
      this.contacts.push(newContact);
      this.saveContacts();
      this.success = `Contacto ${newContact.name} añadido correctamente`;
    }
    
    this.filteredContacts = [...this.contacts];
    this.resetNewContact();
    this.showAddContact = false;
  }

  deleteContact(contact: Contact): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el contacto ${contact.name}?`)) {
      this.contacts = this.contacts.filter(c => c.id !== contact.id);
      this.filteredContacts = this.filteredContacts.filter(c => c.id !== contact.id);
      this.saveContacts();
      this.success = `Contacto ${contact.name} eliminado correctamente`;
    }
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.success = 'Dirección copiada al portapapeles';
      setTimeout(() => this.success = '', 2000);
    });
  }
}