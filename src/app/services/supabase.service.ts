import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Promocao } from '../models/promocao.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const SUPABASE_URL = 'https://wnbnymobuaogqqnjnoby.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYm55bW9idWFvZ3Fxbmpub2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDA2ODksImV4cCI6MjA1MzkxNjY4OX0.zAijMlOQwO5T91ssml7ebNLpdfTsjxjX7xrv4zRNHZM';

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // Método para inserir dados na tabela
  // async insertData(data: any) {
  //   try {
  //     delete data.id; // Remove o ID para evitar conflitos
  
  //     const { data: insertedData, error } = await this.supabase
  //       .from('tbgen_promocoes')
  //       .insert([data]);
  
  //     if (error) {
  //       console.error('Erro ao inserir dados:', error.message);
  //       return { success: false, message: error.message };
  //     }
  
  //     return { success: true, data: insertedData };
  //   } catch (e) {
  //     console.error('Erro inesperado:', e);
  //     return { success: false, message: 'Erro inesperado ao inserir dados.' };
  //   }
  // }

  async insertData(data: any) {
    try {
        delete data.id; // Remove o ID para evitar conflitos

        const { data: insertedData, error } = await this.supabase
            .from('tbgen_promocoes')
            .insert([data])
            .select('id') // Retorna o ID do item recém-inserido
            .single(); // Garante que só retorne um objeto e não um array

        if (error) {
            console.error('Erro ao inserir dados:', error.message);
            return { success: false, message: error.message };
        }

        return { success: true, id: insertedData.id }; // Retorna o ID

    } catch (e) {
        console.error('Erro inesperado:', e);
        return { success: false, message: 'Erro inesperado ao inserir dados.' };
    }
}

  async uploadImage(file: File): Promise<string | null> {
    try {
      const filePath = `images/${Date.now()}-${file.name}`;

      // Upload da imagem
      const { data, error } = await this.supabase.storage
        .from('uploads') // Substitua pelo nome do seu bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Não sobrescreve arquivos existentes
        });

      if (error) throw error;

      // Gerar URL pública
      const { data: publicUrlData } = this.supabase
        .storage
        .from('uploads')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  }

  async getPromocoes(limit: number, offset: number): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('tbgen_promocoes')
        .select('*')
        .order('postedat', { ascending: false })
        .range(offset, offset + limit - 1); // Define o intervalo de resultados
  
      if (error) {
        console.error('Erro ao buscar promoções:', error.message);
        return [];
      }
  
      return data.map((item) => new Promocao(item));
    } catch (err) {
      console.error('Erro inesperado:', err);
      return [];
    }
  }  

  async getCardById(id: number) {
    const { data, error } = await this.supabase
      .from('tbgen_promocoes')  // Substitua 'cards' pelo nome da sua tabela no Supabase
      .select('*')
      .eq('id', id)
      .single(); // A função .single() retorna um único objeto, não um array

    return { data, error };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, message: error.message };
    }

    console.log("✅ Login realizado com sucesso!", data);

    return { success: true, user: data.user };
  }

  // 🟢 Novo Método para verificar se o usuário está logado
  async getUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  // 🟢 Logout
  async logout() {
    await this.supabase.auth.signOut();
    console.log("🚪 Usuário deslogado.");
  }

  async isLoggedIn(): Promise<boolean> {
    const { data } = await this.supabase.auth.getSession();
    
    console.log('🛠️ Sessão do usuário:', data);  // 🔍 Debug
  
    return data.session !== null;  // Verifica se há uma sessão ativa
  }
  
}
