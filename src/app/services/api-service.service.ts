import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ApiServiceService {
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

  getCampaigns(payload :any = {}) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}get-Allcampaign`,payload);
  }

  getCampaignById(campaignId : string) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.get<{success: boolean,msg : string,data: any}>(`${this.baseUrl}getCampaginByUser/${campaignId}`);
  }


  
  createCampaign(campaignData: any) : Observable<{success: boolean,msg : string,data: any}>{
    const token = this.getToken();
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}create-campaign`, campaignData);
  }

  investInCampaign(campaign_id : string,walletAddress : string, amount : number) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}invest-campaign`,{campaign_id,walletAddress, amount});
  }

  updateCampaign(status : number,campaignAddress : string) : Observable<{success: boolean,msg : string,data: any}>{
    return this.http.post<{success: boolean,msg : string,data: any}>(`${this.baseUrl}update-campaign`,{status , campaignAddress})
  };

  get_myCampaigns(page: number = 1, status?: string): Observable<{ success: boolean; msg: string; data: any }> {
    let params = new HttpParams().set('page', page);
    if (status !== undefined) params = params.set('status', status);

    return this.http.get<{ success: boolean; msg: string; data: any }>(
      `${this.baseUrl}my-campaigns`,{params}  
    );
  }
  

}