// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/pages/dashboard/dashboard.component';
import { HomeComponent } from '../components/auth/home/home.component';


export const routes: Routes = [
  { path: '', redirectTo: '/quickcash', pathMatch: 'full' },
  { path: 'quickcash', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/quickcash' }
];