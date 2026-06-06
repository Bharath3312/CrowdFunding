import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ApiServiceService {
    //http://127.0.0.1:54321/functions/v1/auth-wallet/get-nonce
  baseUrl =  environment.supabaseUrl;
  private http  = inject(HttpClient);
   getToken(){
    return localStorage.getItem('authToken');
  }

  setToken(token: string){
    localStorage.setItem('authToken', token);
  }

  getNonce(walletAddress: string){
      return this.http.post<{success: boolean,msg : string, nonce: string}>(`${this.baseUrl}auth-wallet/get-nonce`, {walletAddress});
  }

  verifySignature(walletAddress: string, signature: string,nonce: string){
      return this.http.post<{success: boolean,msg : string, token: string}>(`${this.baseUrl}auth-wallet/verify`, {walletAddress, signature, nonce});
  }

  createCampaign(campaignData: any){
    const token = this.getToken();
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}create-campaign`, campaignData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
}