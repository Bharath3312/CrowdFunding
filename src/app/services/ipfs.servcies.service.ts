import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class IpfsServciesService {

  uploadToIpfs = async (file: File): Promise<{status: boolean, cid?: string, error?: string}> => {
        try { 
          const formData = new FormData();
            formData.append("file", file);
            formData.append("network", "public");
            const request = await fetch(environment.ipfsUploadUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${environment.ipfsJwt}`,
              },
              body: formData,
            });
          const response = await request.json();
          if(response && response?.data && response.data?.cid){
            return {status : true, cid: response.data.cid};
          }else throw new Error("Invalid response from IPFS upload");
        }
        catch (error:any) {
          return {status : false, error: error.message || 'IPFS upload failed'};
        }
  }
  
}

