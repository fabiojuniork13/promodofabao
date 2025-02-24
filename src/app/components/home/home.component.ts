import { Component, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Promocao } from '../../models/promocao.model';
import { MatDialog } from '@angular/material/dialog';
import { isPlatformBrowser } from '@angular/common';
import { DiscountDialogComponent } from '../discount-dialog/discount-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, 
    private supabaseService: SupabaseService, 
    private cdr: ChangeDetectorRef, 
    private dialog: MatDialog) {}

  cards: Promocao[] = [];
  isCopied: boolean = false;

  limit = 9;
  offset = 0;
  carregando = false; // Evita múltiplas requisições simultâneas
  todasCarregadas = false; // Flag para saber se todas as promoções foram carregadas

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.supabaseService.getPromocoes(this.limit, this.offset).then(promocoes => {
        this.cards = promocoes;
        this.offset += this.limit;
        this.cdr.detectChanges();
      }).catch(err => {
        console.error('Erro ao carregar promoções:', err);
      });
    }
  }

  navigateToDetail(id?: number) {
    if (id !== undefined) {
      this.router.navigate(['/card', id]);
    }
  }

  openDiscountDialog(card: any) {
    this.dialog.open(DiscountDialogComponent, {
      data: card,
      width: '400px'
    });
  }

  copiarCupom(cupom: string) {
    navigator.clipboard.writeText(cupom).then(() => {
        this.isCopied = true;
        setTimeout(() => {
            this.isCopied = false;
        }, 2000);
    });
  }

  getTimeAgo(postedAt: string): string {
    const now = new Date();
    const postedDate = new Date(postedAt);
    const diffInSeconds = Math.floor((now.getTime() - postedDate.getTime()) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) {
      return `há ${minutes} minuto${minutes === 1 ? '' : 's'}`;
    } else if (hours < 24) {
      return `há ${hours} hora${hours === 1 ? '' : 's'}`;
    } else {
      return `há ${days} dia${days === 1 ? '' : 's'}`;
    }
  }

  async carregarPromocoes(): Promise<void> {
    if (this.carregando || this.todasCarregadas) return;

    this.carregando = true;

    const novasPromocoes = await this.supabaseService.getPromocoes(this.limit, this.offset);

    if (novasPromocoes.length > 0) {
      this.cards.push(...novasPromocoes);
      this.offset += this.limit;
    } else {
      this.todasCarregadas = true; // Para de carregar se não houver mais promoções
    }

    this.carregando = false;
  }

  @HostListener('window:scroll', [])
    onScroll(): void {
      if (isPlatformBrowser(this.platformId)) {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !this.carregando) {
          this.carregarPromocoes();
        }
      }
}

  openLink(link?: string) {
    window.open(link, '_blank');
  }

  entrarNoGrupo() {
    window.open('https://chat.whatsapp.com/F8MfeLEAaVMIEHJZm8Jfzs', '_blank');
  }

}
