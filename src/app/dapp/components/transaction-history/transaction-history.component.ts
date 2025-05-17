import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Add this import
import { EtherService } from '../../services/ether.service';
import { EtherscanService } from '../../services/etherscan.service';
import { Transaction } from '../../interfaces/transaction.interface';
import { ethers } from 'ethers';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    public etherService: EtherService,
    private etherscanService: EtherscanService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    if (!this.etherService.isConnected() || !this.etherService.currentAccount() || !this.etherService.network()) {
      return;
    }

    this.loading = true;
    this.error = null;

    const account = this.etherService.currentAccount();
    const chainId = this.etherService.network()?.chainId || 1;

    this.etherscanService.getTransactionHistory(account, chainId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.error = 'No se pudieron cargar las transacciones. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  formatValue(value: string): string {
    return ethers.utils.formatEther(value);
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  getTransactionLink(hash: string): string {
    const chainId = this.etherService.network()?.chainId || 1;
    return this.etherscanService.getExplorerUrl(chainId, hash);
  }

  getTransactionStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  retry(): void {
    this.loadTransactions();
  }
}
