import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { MatCardActions, MatCardHeader } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-discount-dialog',
  templateUrl: './discount-dialog.component.html',
  styleUrls: ['./discount-dialog.component.css'],
  imports: [MatDialogContent, MatIcon, MatCardActions, MatDividerModule, MatCardHeader, NgClass]
})
export class DiscountDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DiscountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public card: any
  ) {}

  isCopied: boolean = false;

  copiarCupom(cupom: string) {
    navigator.clipboard.writeText(cupom).then(() => {
        this.isCopied = true;
        setTimeout(() => {
            this.isCopied = false; // Reseta para "Copiar" após 2 segundos
        }, 3000);
    });
  }

  getCouponInfo(coupon: string) {
    if (!coupon) return { isUrl: false, text: '' };

    // Regex para detectar URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = coupon.match(urlRegex);

    if (urls) {
      // Se for URL, limpamos o texto removendo o link e palavras repetitivas
      const cleanText = coupon.replace(urlRegex, '').replace("Resgate o", "").replace("Resgate", "").trim();
      return { 
        isUrl: true, 
        url: urls[0], 
        text: cleanText || 'Link promocional' 
      };
    }

    return { isUrl: false, text: coupon };
  }

  // Melhore a função de ação para lidar com os dois casos
  handleCouponAction(card: any) {
    const info = this.getCouponInfo(card.coupon);
    if (info.isUrl) {
      window.open(info.url, '_blank');
    } else {
      this.copiarCupom(card.coupon);
    }
  }

  openLink(link: string) {
    window.open(link, '_blank');
    this.dialogRef.close();
  }

  getFontClass(subtitle: string): string {
    const length = subtitle ? subtitle.length : 0;
    if (length <= 10) {
      return 'font-large';
    } else if (length <= 20) {
      return 'font-medium';
    } else {
      return 'font-small';
    }
  }

}