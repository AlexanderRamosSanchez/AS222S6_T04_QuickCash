import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css'
})
export class IntroductionComponent {

  constructor(private router: Router) {}

  navigateToLogin(): void {
    this.router.navigate(["/login"]);
  }
}