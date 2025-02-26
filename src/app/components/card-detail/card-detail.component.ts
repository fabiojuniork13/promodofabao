import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { SupabaseService } from '../../services/supabase.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DiscountDialogComponent } from '../discount-dialog/discount-dialog.component';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-card-detail',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css'
})
export class CardDetailComponent {
  card: any;
  isCopied: boolean = false;

  constructor(
              @Inject(PLATFORM_ID) private platformId: Object,
              private route: ActivatedRoute, 
              private router: Router, 
              private supabaseService: SupabaseService, 
              private dialog: MatDialog,
              private meta: Meta,
              private title: Title
              ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      // Buscar o card da Supabase com o ID
      try {
        const { data, error } = await this.supabaseService.getCardById(id);

        if (error) {
          console.error('Erro ao buscar o card:', error);
        } else {
          this.card = data;
          this.title.setTitle(this.card.subtitle);
          this.loadCardData();
        }
      } catch (error) {
        console.error('Erro ao buscar o card:', error);
      }
    } else if(isPlatformServer(this.platformId)) {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      // Buscar o card da Supabase com o ID
      try {
        const { data, error } = await this.supabaseService.getCardById(id);

        if (error) {
          console.error('Erro ao buscar o card:', error);
        } else {
          this.card = data;
          this.loadCardData();
        }
      } catch (error) {
        console.error('Erro ao buscar o card:', error);
      }
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openLink(link?: string) {
    window.open(link, '_blank');
  }

  copiarCupom(cupom: string) {
    navigator.clipboard.writeText(cupom).then(() => {
        this.isCopied = true;
        setTimeout(() => {
            this.isCopied = false; // Reseta para "Copiar" após 2 segundos
        }, 3000);
    });
  }

  getTimeAgo(postedAt: string): string {
    const now = new Date();
    const postedDate = new Date(postedAt + "Z");
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

  openDiscountDialog(card: any) {
    this.dialog.open(DiscountDialogComponent, {
      data: card,
      width: '400px'
    });
  }

  loadCardData(): void {
    // Atualize as meta tags
    this.meta.addTag({ property: 'og:title', content: this.card.title });
    this.meta.addTag({ property: 'og:description', content: this.card.subtitle });
    this.meta.addTag({ property: 'og:image', content: this.card.image });
    this.meta.addTag({ property: 'og:image:width', content: '350' });
    this.meta.addTag({ property: 'og:image:height', content: '330' });
    this.meta.addTag({ property: 'og:url', content: window.location.href });

    // Para o WhatsApp, você pode usar o mesmo conteúdo ou personalizar
    this.meta.addTag({ property: 'twitter:title', content: this.card.title });
    this.meta.addTag({ property: 'twitter:description', content: this.card.subtitle });
    this.meta.addTag({ property: 'twitter:image', content: this.card.image });
  }
}
