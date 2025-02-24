import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
              @Inject(PLATFORM_ID) private platformId: Object,
              private supabaseService: SupabaseService, 
              private router: Router) {}

  username: string = '';
  password: string = '';
  errorMessage: string | undefined = '';
  isLoading: boolean = false;

  async login(event: Event) {
    event.preventDefault();
    this.isLoading = true;  // Ativa o loading
  
    const user = (document.getElementById('user') as HTMLTextAreaElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    
    const response = await this.supabaseService.login(user, password);
  
    if (response.success) {
      console.log('Usuário logado com sucesso!', response.user);
      this.router.navigate(['/register']);
    } else { 
      this.errorMessage = response.message;
    }
  
    this.isLoading = false;  // Desativa o loading
  }
}
