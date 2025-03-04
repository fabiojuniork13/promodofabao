import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Promocao } from '../../models/promocao.model';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { WhatsappService } from '../../services/whatsapp.service';
import { style } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatCardModule,
    MatIcon,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  providers: [WhatsappService],
  standalone: true
})
export class RegisterComponent {
  listaCupons: { cupom: string, mensagem: string }[] = [{ cupom: "", mensagem: "" }];
  selectedFile: File | null = null; // Armazena temporariamente o arquivo
  previewImage: string | null = null;
  imageUrl: string | null = null; // URL da imagem no Supabase
  cupomSelecionado: string = '';

  constructor(private supabaseService: SupabaseService, 
              private snackBar: MatSnackBar, 
              private router: Router,
              private dialog: MatDialog) {}

  frete: boolean = false;
  relampago: boolean = false;
  pix: boolean = false;
  parcelado: boolean = false;
  avista: boolean = false;
  menorPreco: boolean = false;
  fretePrime: boolean = false;
  freteMeli: boolean = false;
  freteRetire: boolean = false;
  fretePoss: boolean = false;
  enviarImg: boolean = false;
  imageBase64: string | undefined;

  formData!: FormData;

  forWhats!: string;

  ngOnInit(): void {
    // this.carregarComboCupons();
  }

  exibirMensagem(mensagem: string, tipo: string = "sucesso"): void {
    const divMensagem =
      tipo === "sucesso" ? document.getElementById('mensagem-cupom') : document.getElementById('mensagem-erro');
    if (divMensagem) {
      divMensagem.textContent = mensagem;
      divMensagem.style.display = 'block';
      setTimeout(() => {
        divMensagem.style.display = 'none';
      }, 3000);
    }
  }

  adicionarCupom(): void {
    const novoCupom = (document.getElementById('novoCupom') as HTMLInputElement).value.trim();
    const mensagemCupom = (document.getElementById('mensagemCupom') as HTMLInputElement).value.trim();

    if (novoCupom) {
      const cupomExistente = this.listaCupons.find(item => item.cupom === novoCupom);
      if (cupomExistente) {
        this.exibirMensagem(`O cupom "${novoCupom}" já está cadastrado.`, "erro");
      } else {
        this.listaCupons.push({ cupom: novoCupom, mensagem: mensagemCupom });
        this.exibirMensagem("Cupom adicionado com sucesso!", "sucesso");
      }
      (document.getElementById('novoCupom') as HTMLInputElement).value = '';
      (document.getElementById('mensagemCupom') as HTMLInputElement).value = '';
    } else {
      this.exibirMensagem("Por favor, insira o nome do cupom.", "erro");
    }
  }

  formatarDados(): void {
    const input = (document.getElementById('input') as HTMLTextAreaElement).value;
    const alerta = (document.getElementById('alerta') as HTMLInputElement).value;
    const comboCupons = document.getElementById('comboCupons') as HTMLSelectElement;
    const cupomSelecionado = comboCupons.textContent;
    const mensagemCupom = this.listaCupons.find(item => item.cupom === cupomSelecionado)?.mensagem || "";
    const output = document.getElementById('output');
    const outputInstagram = document.getElementById('outputInstagram');
    const copiarButton = document.getElementById('copiarButton');
    const enviarWhatsButton = document.getElementById('enviarWhatsButton');
    const cadastraButton = document.getElementById('cadastraButton');
    const copiarButtonInstagram = document.getElementById('copiarButtonInstagram');

    const linhas = input.split('\n').filter(linha => linha.trim() !== '');
    let titulo = '',
      precoOriginal = '',
      precoPromocional = '',
      links: string[] = [];

    linhas.forEach(linha => {
      if (linha.startsWith('R$')) {
        const precos = linha.match(/R\$\s?-?[\d.,]+/g);
        if (precos) {
          precoOriginal = precos.length > 1 ? '~' + this.formatarPreco(precos[0]) + '~' : '';
          precoPromocional = '*' + this.formatarPreco(precos[precos.length - 1]) + '*';
        }
      } else if (linha.startsWith('http')) {
        links.push(linha);
      } else {
        titulo = linha;
      }
    });

    if (!titulo) {
      this.exibirMensagem("Por favor, insira o título do produto.", "erro");
      return;
    }
    if (!precoPromocional) {
      this.exibirMensagem("Por favor, insira os preços corretamente.", "erro");
      return;
    }

    if (this.pix) precoPromocional += " (No pix)";
    if (this.parcelado) precoPromocional += " (Parcelado sem juros)";
    if (this.avista) precoPromocional += " (À vista)";

    let resultado = `*${titulo}*\n\n`;

    if (this.menorPreco) {
      resultado += `📉 Menor preço!\n\n`;
    }

    if (precoOriginal) {
      resultado += `❌ De ${precoOriginal}\n`;
    }
    resultado += `🔥 Por ${precoPromocional}`;

    if (cupomSelecionado) {
      resultado += `\n🏷️ Cupom: ${cupomSelecionado}${
        mensagemCupom ? " - " + "🚫 _" + mensagemCupom + "_" : ""
      }`;
    }

    if (alerta) {
      resultado += `\n⚠️ ${alerta}`;
    }

    if (this.relampago) {
      resultado += `\n⚡ Oferta relâmpago! Correee! 🏃💨`;
    }

    if (this.frete) {
      resultado += `\n\n📦 Frete grátis para todo o Brasil.`;
    }

    if (this.fretePrime) {
      resultado += `\n\n📦 Frete Grátis Amazon Prime.`;
    }

    if (this.freteMeli) {
      resultado += `\n\n📦 Frete Grátis assinantes Meli+.`;
    }

    if (this.freteRetire) {
      resultado += `\n\n📦 Retire na loja e não pague frete.`;
    }

    if (this.fretePoss) {
      resultado += `\n\n📦 Possibilidade de Frete Grátis.`;
    }

    if (links.length === 1) {
      resultado += `\n\n🛒 ${links[0]}`;
    } else if (links.length === 2) {
      resultado += `\n\n📲 [NO APP] ${links[0]}\n💻 [NO SITE] ${links[1]}`;
    }

    if (output) {
      output.textContent = resultado;
      this.forWhats = resultado;
      output.style.whiteSpace = 'pre-line';
      copiarButton!.style.display = 'flex';
      cadastraButton!.style.display = 'flex';
      enviarWhatsButton!.style.display = 'flex';
    }

    let outputForInstagram = resultado.replace(/[\*~]/g, "");
    outputForInstagram = outputForInstagram + "\n\n🌐 Entre no nosso grupo de promoções: https://chat.whatsapp.com/F8MfeLEAaVMIEHJZm8Jfzs";

    if (outputInstagram) {
      outputInstagram.textContent = outputForInstagram;
      outputInstagram.style.whiteSpace = 'pre-line';
      copiarButtonInstagram!.style.display = 'flex';
    }
  }

  async cadastrarPromocao(): Promise<void> {
    const input = (document.getElementById('input') as HTMLTextAreaElement).value;
    const alerta = (document.getElementById('alerta') as HTMLInputElement).value;
    const comboCupons = document.getElementById('comboCupons') as HTMLSelectElement;
    const cupomSelecionado: any = comboCupons.textContent;

    // Aguarda a URL da imagem antes de continuar
    let imageUrl: any;
    if (this.selectedFile) {
        await this.uploadImage();
    }

    const linhas = input.split('\n').filter(linha => linha.trim() !== '');
    let titulo: string = '',
        precoOriginal: string = '',
        precoPromocional: string = '',
        link: string = '',
        metodoPagamento: string = '',
        alertStr: string = '',
        marketplace = '';

    linhas.forEach(linha => {
        if (linha.startsWith('R$')) {
            const precos = linha.match(/R\$\s?-?[\d.,]+/g);
            if (precos) {
                precoOriginal = precos.length > 1 ? this.formatarPreco(precos[0]) : '';
                precoPromocional = this.formatarPreco(precos[precos.length - 1]);
            }
        } else if (linha.startsWith('http')) {
            link = linha;
        } else {
            titulo = linha;
        }
    });

    if (this.pix) metodoPagamento = "No pix";
    if (this.parcelado) metodoPagamento = "Parcelado sem juros";
    if (this.avista) metodoPagamento = "À vista";

    if (alerta) {
        alertStr = alerta;
    }

    if (link.includes('shopee')) {
        marketplace = 'Shopee';
    } else if (link.includes('amzn.to')) {
        marketplace = 'Amazon';
    } else if (link.includes('mercadolivre')) {
        marketplace = 'Mercado Livre';
    } else if (link.includes('magazineluiza') || link.includes('magazine')) {
        marketplace = 'Magazine Luiza';
    } else if (link.includes('kabum')) {
      marketplace = 'Kabum';
    } else if (link.includes('decathlon')) {
      marketplace = 'Decathlon';
    } else if (link.includes('aliexpress')) {
      marketplace = 'Aliexpress';
    } else {
        marketplace = 'Desconhecido';
    }

    const promo = new Promocao({
        subtitle: titulo,
        oldprice: precoOriginal,
        newprice: precoPromocional,
        marketplace: marketplace,
        link: link,
        postedat: new Date(),
        paymentmethod: metodoPagamento,
        coupon: cupomSelecionado,
        image: this.imageUrl, // Agora a URL correta será enviada
        alert: alertStr
    });

    const { id, ...promoData } = promo;

    try {
        const result = await this.supabaseService.insertData(promoData);
        if (result.success) {
            const novoIdPromo = result.id;
            const novaMensagem = this.forWhats;
            this.forWhats = this.modificarMensagem(novaMensagem, 'https://promodofabin.netlify.app/product/' + novoIdPromo);
            console.log(this.forWhats);
            this.snackBar.open('Promoção cadastrada com sucesso! ✅', 'Fechar', {
                duration: 3000,
                panelClass: ['success-snackbar']
            });

            this.forWhats += ''
        } else {
            throw new Error('Erro ao cadastrar promoção.');
        }
    } catch (error) {
        this.snackBar.open('Erro ao cadastrar a promoção. 🚨', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
        });
    }
}

modificarMensagem(mensagem: string, conteudo: string): string {
  return mensagem
    .split('\n') // Divide o texto em linhas
    .map(linha => linha.includes('http') ? '🛒' + conteudo : linha) // Substitui a linha do link
    .join('\n'); // Junta as linhas de volta
}

isLoading = false;

// enviarPromoWhats() {
//   this.isLoading = true; // Ativa o carregamento
//   const enviarWhatsButton = document.getElementById('enviarWhatsButton');

//   // const destinatario = ['Promoção do Fabin']; 
//   const destinatario = ['4195737521']; 
//   console.log(destinatario);
//   console.log(this.forWhats);

//   let img: any;

//   if(this.enviarImg && this.imageBase64) {
//     img = this.imageBase64;
//   } else {
//     img = '';
//   }

//   if (this.forWhats) {
//     this.whatsappService.enviarDados(destinatario, this.forWhats, img).subscribe(
//       (response) => {
//         this.isLoading = false;
//         enviarWhatsButton!.style.display = 'flex';
//         console.log('Resposta do servidor:', response);
//         this.snackBar.open('Promoção enviada com sucesso! ✅', 'Fechar', {
//           duration: 3000,
//           panelClass: ['success-snackbar']
//         });
//       },
//       (error) => {
//         this.isLoading = false;
//         enviarWhatsButton!.style.display = 'flex';
//         console.error('Erro ao enviar dados:', error);
//         this.snackBar.open('Erro ao enviar a promoção. 🚨', 'Fechar', {
//           duration: 3000,
//           panelClass: ['error-snackbar']
//         });
//       }
//     );
//   } else {
//     this.isLoading = false; // Caso não haja dados, encerra o carregamento
//   }
// }

enviarPromoWhats() {
  this.isLoading = true; // Ativa o carregamento
  const enviarWhatsButton = document.getElementById('enviarWhatsButton');

  // Definindo destinatários e conteúdo
  const destinatario = ['Promoção do Fabin']; // Exemplo de destinatário
  console.log(destinatario);
  console.log(this.forWhats);

  let img: any;

  // Verificar se há uma imagem
  if (this.enviarImg && this.imageBase64) {
    img = this.imageBase64;
  } else {
    img = ''; // Se não houver imagem, setar vazio
  }

  // Verifica se há conteúdo para enviar
  if (this.forWhats) {
    // Preparar o corpo da requisição para o Supabase
    const messageData = {
      destinatario: destinatario[0], // Destinatário (podemos usar apenas um número aqui)
      conteudo: this.forWhats, // Conteúdo da mensagem
      image: img, // Imagem (se houver)
      status: 'pendente', // Status inicial da mensagem (ex: pendente)
    };

    // Inserir os dados na tabela 'tbgen_messages' no Supabase
    this.supabaseService.insertMessage(messageData).then((result) => {
      this.isLoading = false;
      enviarWhatsButton!.style.display = 'flex';

      if (result.success) {
        console.log('Mensagem registrada com sucesso! ID:', result.id);
        this.snackBar.open('Promoção enviada com sucesso! ✅', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      } else {
        console.error('Erro ao registrar mensagem:', result.message);
        this.snackBar.open('Erro ao enviar a promoção. 🚨', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    }).catch((error: any) => {
      this.isLoading = false;
      enviarWhatsButton!.style.display = 'flex';
      console.error('Erro ao enviar dados:', error);
      this.snackBar.open('Erro ao enviar a promoção. 🚨', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    });
  } else {
    this.isLoading = false; // Caso não haja dados, encerra o carregamento
  }
}


// Método para converter a imagem em Base64
convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove o prefixo "data:image/png;base64," da string
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

  copiarTexto(): void {
    const output = document.getElementById('output');
    const mensagem = document.getElementById('mensagem-copiar');

    if (output && mensagem) {
      const textarea = document.createElement('textarea');
      textarea.value = output.textContent || '';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      mensagem.style.display = 'block';
      setTimeout(() => {
        mensagem.style.display = 'none';
      }, 3000);
    }
  }

  copiarTextoInstagram(): void {
    const output = document.getElementById('outputInstagram');
    const mensagem = document.getElementById('mensagem-copiar-instagram');

    if (output && mensagem) {
      const textarea = document.createElement('textarea');
      textarea.value = output.textContent || '';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      mensagem.style.display = 'block';
      setTimeout(() => {
        mensagem.style.display = 'none';
      }, 3000);
    }
  }

  limparCampos(): void {
    this.frete = false;
    this.relampago = false;
    this.pix = false;
    this.parcelado = false;
    this.avista = false;
    this.menorPreco = false;
    this.fretePrime = false;
    this.freteMeli = false;
    this.freteRetire = false;
    this.fretePoss = false;
    this.enviarImg = false;
    this.imageBase64 = undefined;
    
    this.forWhats = '';

    const output = document.getElementById('output');
    if (output) output.textContent = '';
    const outputInstagram = document.getElementById('outputInstagram');
    if (outputInstagram) outputInstagram.textContent = '';
    
    (document.getElementById('input') as HTMLSelectElement).value = '';
    (document.getElementById('comboCupons') as HTMLSelectElement).value = '';
    (document.getElementById('novoCupom') as HTMLInputElement).value = '';
    (document.getElementById('mensagemCupom') as HTMLInputElement).value = '';
    (document.getElementById('campoLink') as HTMLInputElement).value = '';
    (document.getElementById('copiarButton') as HTMLInputElement).style.display = 'none';
    (document.getElementById('copiarButtonInstagram') as HTMLInputElement).style.display = 'none';
    (document.getElementById('alerta') as HTMLInputElement).value = '';
    
    this.cupomSelecionado = '';

    // Limpar a imagem
    this.selectedFile = null;
    this.previewImage = '';

    // Opcional: resetar o campo de input de arquivo, se necessário
    const imageInput = document.getElementById('image-upload') as HTMLInputElement;
    if (imageInput) {
        imageInput.value = '';
    }
  }

  formatarPreco(preco: string): string {
    let valor = preco.replace(/R\$\s?/g, '').replace('-', '').trim();

    if (/^\d+\.\d{2}$/.test(valor)) {
      valor = valor.replace('.', ',');
      if (valor.includes(',')) {
        let partes = valor.split(',');
        let inteiro = partes[0];
        let decimal = partes[1];
        if (/^\d+$/.test(inteiro) && /^\d{2}$/.test(decimal)) {
          inteiro = parseInt(inteiro, 10).toLocaleString('pt-BR');
          valor = `${inteiro},${decimal}`;
        }
      } else {
        valor = parseFloat(valor).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
    } else {
      valor = valor.replace(/\./g, '');
      if (valor.includes(',')) {
        let partes = valor.split(',');
        let inteiro = partes[0];
        let decimal = partes[1];

        if (/^\d+$/.test(inteiro) && /^\d{2}$/.test(decimal)) {
          inteiro = parseInt(inteiro, 10).toLocaleString('pt-BR');
          valor = `${inteiro},${decimal}`;
        }
      } else {
        valor = parseFloat(valor).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
    }
    return `R$ ${valor}`;
  }

  tratarLink(): void {
    const output = document.getElementById('output');
    const campoLink = (document.getElementById('campoLink') as HTMLInputElement).value;
    
    // Expressão regular para capturar qualquer nome após "magazinevoce.com.br/"
    let texto = campoLink.replace(/(magazinevoce\.com\.br\/)[^\/]+/, '$1magazinekobaif');

    if (output) output.textContent = texto;
  }

  onFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
          this.processFile(input.files[0]);
      }
  }

  onDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer!.dropEffect = "copy";
  }

  onDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
          this.processFile(event.dataTransfer.files[0]);
      }
  }

  onPaste(event: ClipboardEvent) {
      if (event.clipboardData && event.clipboardData.items.length > 0) {
          const items = event.clipboardData.items;
          for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf("image") !== -1) {
                  const file = items[i].getAsFile();
                  if (file) {
                    this.processFile(file); // Passa o arquivo corretamente
                  }
              }
          }
      }
  }

  async processFile(file: File) {
    this.selectedFile = file; // Armazena o arquivo na variável selectedFile
    const reader = new FileReader();
    reader.onload = (e: any) => {
        this.previewImage = e.target.result;
    };
    reader.readAsDataURL(file);

    this.convertImageToBase64(file).then((base64: string) => {
      this.imageBase64 = base64; // Armazena a imagem convertida
      console.log('Imagem em Base64:', this.imageBase64);
    }).catch(error => {
      console.error('Erro ao converter a imagem:', error);
    });
  }

  // Faz o upload apenas quando chamar essa função (ex: ao cadastrar a promoção)
  async uploadImage() {
    if (!this.selectedFile) {
      console.error('Nenhuma imagem selecionada para upload.');
      return;
    }

    const url = await this.supabaseService.uploadImage(this.selectedFile);
    if (url) {
      this.imageUrl = url;
      console.log('Imagem enviada com sucesso:', url);
    }
  }

  logout() {
    this.supabaseService.logout();
    this.router.navigate(['/login']);
  }

  // deletarPromo() {
  //   const campoId = (document.getElementById('deletePromo') as HTMLInputElement).value;
    
  //   if (campoId) {
  //       const id = parseInt(campoId, 10); // Converte para número
        
  //       if (!isNaN(id)) {
  //           this.supabaseService.deletePromo(id).then(response => {
  //             if (response.success) {
  //               this.snackBar.open('Promoção removida com sucesso! ✅', 'Fechar', {
  //                 duration: 3000,
  //                 panelClass: ['success-snackbar'],
  //               });
  //             } else {
  //               this.snackBar.open('Erro ao remover a promoção. 🚨', 'Fechar', {
  //                 duration: 3000,
  //                 panelClass: ['error-snackbar'],
  //               });
  //             }
  //           });
  //       } else {
  //         this.snackBar.open('Id inválido. 🚨', 'Fechar', {
  //           duration: 3000,
  //           panelClass: ['error-snackbar'],
  //         });
  //       }
  //   } else {
  //     this.snackBar.open('Campo Id vazio. 🚨', 'Fechar', {
  //       duration: 3000,
  //       panelClass: ['error-snackbar'],
  //     });
  //   }
  // }

  deletarPromo() {
    const campoId = (document.getElementById('deletePromo') as HTMLInputElement).value;

    if (!campoId) {
      this.snackBar.open('Campo Id vazio. 🚨', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const id = parseInt(campoId, 10);
    if (isNaN(id)) {
      this.snackBar.open('Id inválido. 🚨', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    // Abre o diálogo de confirmação
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Tem certeza que deseja remover a promoção com ID ${id}?` },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Se o usuário confirmar, chama o serviço para deletar
        this.supabaseService.deletePromo(id).then(response => {
          if (response.success) {
            this.snackBar.open('Promoção removida com sucesso! ✅', 'Fechar', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
            } else {
              this.snackBar.open('Erro ao remover a promoção. 🚨', 'Fechar', {
                duration: 3000,
                panelClass: ['error-snackbar'],
              });
            }
        });
      }
    });
  }
}