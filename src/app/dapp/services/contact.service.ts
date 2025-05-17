// src/app/dapp/services/contact.service.ts
import { Injectable, signal } from '@angular/core';
import { Contact } from '../interfaces/contact.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // Signals
  contacts = signal<Contact[]>([]);
  
  constructor() {
    this.loadContacts();
  }

  private loadContacts(): void {
    const storedContacts = localStorage.getItem('dapp_contacts');
    if (storedContacts) {
      try {
        this.contacts.set(JSON.parse(storedContacts));
      } catch (error) {
        console.error('Error al cargar contactos:', error);
        this.contacts.set([]);
      }
    }
  }

  private saveContacts(): void {
    localStorage.setItem('dapp_contacts', JSON.stringify(this.contacts()));
  }

  getContacts(): Contact[] {
    return this.contacts();
  }

  getContactByAddress(address: string): Contact | undefined {
    return this.contacts().find(contact => 
      contact.address.toLowerCase() === address.toLowerCase()
    );
  }

  addContact(contact: Omit<Contact, 'id' | 'createdAt'>): Contact {
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    
    this.contacts.update(contacts => [...contacts, newContact]);
    this.saveContacts();
    return newContact;
  }

  updateContact(id: string, updatedContact: Partial<Contact>): boolean {
    let updated = false;
    
    this.contacts.update(contacts => {
      const newContacts = contacts.map(contact => {
        if (contact.id === id) {
          updated = true;
          return { ...contact, ...updatedContact };
        }
        return contact;
      });
      return newContacts;
    });
    
    if (updated) {
      this.saveContacts();
    }
    
    return updated;
  }

  deleteContact(id: string): boolean {
    const initialLength = this.contacts().length;
    
    this.contacts.update(contacts => 
      contacts.filter(contact => contact.id !== id)
    );
    
    if (initialLength !== this.contacts().length) {
      this.saveContacts();
      return true;
    }
    
    return false;
  }

  addressExists(address: string): boolean {
    return this.contacts().some(contact => 
      contact.address.toLowerCase() === address.toLowerCase()
    );
  }

  nameExists(name: string): boolean {
    return this.contacts().some(contact => 
      contact.name.toLowerCase() === name.toLowerCase()
    );
  }
}
