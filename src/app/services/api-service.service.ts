import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ApiServiceService {
    //http://127.0.0.1:54321/functions/v1/auth-wallet/get-nonce
  baseUrl =  environment.backendUrl;
  private http  = inject(HttpClient);
   getToken(){
    return localStorage.getItem('authToken');
  }

setToken(token: string, account: string) {
  localStorage.setItem('authToken', token);
  const expiryTime = Date.now() + (3300 * 1000); // now + 55 mins
  localStorage.setItem('tokenExpiry', expiryTime.toString());
  localStorage.setItem('verifyAccount', account);
}

  getNonce(walletAddress: string) : Observable<{success: boolean,msg : string, data: string}>{
    const params = {walletAddress};
      return this.http.get<{success: boolean,msg : string, data: string}>(`${this.baseUrl}auth-wallet/get-nonce`, {params});
  }

  verifySignature(walletAddress: string, signature: string,nonce: string): Observable<{success: boolean,msg : string, data: any}>{
      return this.http.post<{success: boolean,msg : string, data: any}>(`${this.baseUrl}auth-wallet/verify`, {walletAddress, signature, nonce});
  }

  createCampaign(campaignData: any) : Observable<{success: boolean,msg : string,data: any}>{
    const token = this.getToken();
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}create-campaign`, campaignData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  getCampaigns(payload :any = {}) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}get-campaign`,payload,{
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  getCampaignById(campaignId : string) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.get<{success: boolean,msg : string,data: any}>(`${this.baseUrl}getCampaginByUser/${campaignId}`);
  }

  investInCampaign(campaign_id : string,walletAddress : string, amount : number) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}invest-campaign`,{campaign_id,walletAddress, amount},{
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  updateCampaign(status : number,campaignAddress : string) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}update-campaign`,{status , campaignAddress},{
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      }
    })
  };

  get_myCampaigns(page: number = 1, status?: number): Observable<{ success: boolean; msg: string; data: any }> {
    let params = new HttpParams().set('page', page);
    if (status !== undefined) params = params.set('status', status);

    return this.http.get<{ success: boolean; msg: string; data: any }>(
      `${this.baseUrl}my-campaigns`,
      {
        params,
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      }  // ← single options object ✅
    );
  }
  

}