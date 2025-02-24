import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  private apiUrl = 'http://177.201.197.63:8090/zap-zap'; // Substitua pela URL da API

  constructor(private http: HttpClient) { }

  enviarDados(destinatario: any, conteudo: any): Observable<any> {
    console.log(destinatario);
    console.log(conteudo);
    const dados = {
      contatos: destinatario,
      conteudo: conteudo,
      imagem: ""
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(this.apiUrl, dados, { headers });
  }

}