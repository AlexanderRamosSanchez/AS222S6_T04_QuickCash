import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EtherService } from '../../services/ether.service';
import { WalletComponent } from '../wallet/wallet.component';
import { NetworkDisplayComponent } from '../network-display/network-display.component';
import { SendTransactionComponent } from '../send-transaction/send-transaction.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WalletComponent,
    NetworkDisplayComponent,
    SendTransactionComponent,
    ContactsComponent,
    TransactionHistoryComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedTab: 'overview' | 'send' | 'transactions' | 'contacts' = 'overview';

  constructor(
    public authService: AuthService,
    public etherService: EtherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.etherService.disconnect();
    this.router.navigate(['/login']);
  }

  selectTab(tab: 'overview' | 'send' | 'transactions' | 'contacts'): void {
    this.selectedTab = tab;
  }
}
