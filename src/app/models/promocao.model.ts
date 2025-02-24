export class Promocao {
    id?: number;  // Opcional porque é SERIAL no banco
    oldprice?: string;
    newprice!: string;
    paymentmethod?: string;
    alert?: string;
    link?: string;
    postedat!: Date;
    coupon?: string;
    marketplace?: string;
    title!: string;
    subtitle?: string;
    image?: string | undefined | null;
    description?: string;
  
    constructor(data?: Partial<Promocao>) {
      if (data) {
        Object.assign(this, data);
      }
    }
}
  