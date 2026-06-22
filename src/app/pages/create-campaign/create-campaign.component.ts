import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup,FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IpfsServciesService } from '../../services/ipfs.servcies.service';
import { ContractService } from '../../services/contract.service';
import { signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { ethers } from 'ethers';
import { EvmWalletServices } from '../../services/evm-wallet.services';
import { WalletState } from '../../models/wallet-provider.model';
import { ToastService } from '../../services/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiServiceService } from '../../services/api-service.service';

export function maxWords(max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const words = control.value
      // .trim()
      // .split(/\s+/)
      // .filter(Boolean);

    return words.length > max
      ? { maxWords: { required: max, actual: words.length } }
      : null;
  };
}
export function futureDateValidator(control: AbstractControl) {
  if (!control.value) return null;

  const selected = new Date(control.value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return selected < tomorrow ? { invalidDeadline: true } : null;
}

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css']
})
export class CreateCampaignComponent {
  private ipfsService = inject(IpfsServciesService);
  private contractServices = inject(ContractService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private walletServices = inject(EvmWalletServices)
  private apiServices = inject(ApiServiceService)
  loading = signal(false);

  tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  walletState : WalletState  = this.walletServices.walletState$.getValue();

  wallet$ = toSignal(
    this.walletServices.walletState$Observable,
    {initialValue : this.walletServices.walletState$.getValue()}
  )

 constructor( ){
      effect(()=>{
        const state = this.wallet$();
        console.log(state,"from in create-campaign-component...");
        
        console.log("state change in create campagin component",state);
        if(!state.isConnected){
          this.toast.error('Error','Please connect your wallet to create a campaign');
          this.router.navigate(['/']);
        }else {
          if(!state.isVerified && this.walletState.isVerified){
            this.toast.error('Error','Please Verify the you wallet..');
          }
          if(!this.walletState.isVerified && state.isVerified){
            this.toast.success('success',"Account Verified Successfully")
          }
          this.walletState = state;
        }
      })
 }

  myForm = new FormGroup({
    campaignTitle: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      maxWords(30)   // ✅ allow only 150 words
    ]
  }),
    campaignDescription: new FormControl('Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consequatur quibusdam labore nulla qui omnis maiores iusto, nobis porro totam voluptatem.', {
    nonNullable: true,
    validators: [
      Validators.required,
      maxWords(200)   // ✅ allow only 150 words
    ]
  }),
    campaignImage: new FormControl(null as File | null,Validators.required),
    campaignDocument: new FormControl(null as File | null,Validators.required),
    campaignMinimumInvestment: new FormControl('',Validators.required),
    campaignMaximumInvestment: new FormControl('',Validators.required),
    campaignDeadline: new FormControl('', {
      validators: [Validators.required, futureDateValidator]
    }),
    campaignFundingType: new FormControl('',Validators.required),
    campaignCategory: new FormControl('',Validators.required),
  })

   ngOnDestroy() {
    this.loading.set(false);
    console.log("Component destroyed");
  }
  //show user selected image/pdf preview
  previewFile(event: Event, previewId: string, fileType: 'image' | 'pdf'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
      if (!file) return;
    
    const previewContainer = document.getElementById(previewId);
    if (!previewContainer) {
      console.error('Preview container not found:', previewId);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (fileType === 'image') {
         
        const img = previewContainer.querySelector('img') as HTMLImageElement;
        if (img && e.target?.result) {          
          img.src = e.target.result as string;
          this.myForm.get('campaignImage')?.setValue(file);
          previewContainer.classList.remove('hidden');
        }
      } else if (fileType === 'pdf') {
        const iframe = previewContainer.querySelector('iframe') as HTMLIFrameElement;
        const placeholder = previewContainer.querySelector('.p-4') as HTMLElement;
        if (iframe && e.target?.result) {
          iframe.src = e.target.result as string;
          iframe.classList.remove('hidden');
          this.myForm.get('campaignDocument')?.setValue(file);
          if (placeholder) {
            placeholder.classList.add('hidden');
          }
          previewContainer.classList.remove('hidden');
        }
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
    };
    
    reader.readAsDataURL(file);
  }
  //update funding type descriptive text
  updateFundingTypeText(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const textContainer = document.getElementById('funding-type-text');
    const messageElement = document.getElementById('funding-message');
    
    if (!textContainer || !messageElement) return;
    
    if (select.value === 'fixed') {
      messageElement.textContent = 'Once campaign is full you can withdraw';
      textContainer.classList.remove('hidden');
    } else if (select.value === 'flexible') {
      messageElement.textContent = 'Can withdraw whatever amount invested';
      textContainer.classList.remove('hidden');
    } else {
      textContainer.classList.add('hidden');
    }
  }
  //remove selected file preview
  removePreview(previewId: string, inputId: string): void {
    const previewContainer = document.getElementById(previewId);
    const input = document.getElementById(inputId) as HTMLInputElement;
    
    if (previewContainer) {
      previewContainer.classList.add('hidden');
      const img = previewContainer.querySelector('img');
      const iframe = previewContainer.querySelector('iframe');
      const placeholder = previewContainer.querySelector('.p-4') as HTMLElement;
      
      if (img) img.src = '';
      if (iframe) {
        iframe.src = '';
        iframe.classList.add('hidden');
      }
      if (placeholder) {
        placeholder.classList.remove('hidden');
      }
    }
    
    if (input) {
      input.value = '';
    }
  }

  async createCampaign(){
    console.log("createCampaign");
    this.loading.set(true);
    if(this.myForm.valid){
            console.log(this.myForm.value);
      if(!this.myForm.value.campaignImage ){
        console.log("No file selected for upload");
        return;
      }
       if(!this.myForm.value.campaignDocument){
        console.log("No file selected for upload");
        return;
      }
      const getImgIpfsHash = {cid:"bafkreih226sg3zddtozlvntteytgfogoc7jwob52q35aho273j3kqrphuy" , status : true ,error:""}  //await this.ipfsService.uploadToIpfs(this.myForm.value.campaignImage);
      if(!getImgIpfsHash.status){
        console.log("Image upload to IPFS failed", getImgIpfsHash.error);
        return;
      }
      const getPdfIpfsHash = {cid:"bafkreigy2s4bfabvw22e4arj777wprtbvmb65oc5z3fzufe6za3bkchyca" , status : true ,error:""} ///await this.ipfsService.uploadToIpfs(this.myForm.value.campaignDocument);
      if(!getPdfIpfsHash.status){
        console.log("PDF upload to IPFS failed", getPdfIpfsHash.error);
        return;
      }
      const payloadData = {
        ...this.myForm.value,
        campaignImage : getImgIpfsHash.cid,
        campaignDocument : getPdfIpfsHash.cid
      }
      console.log(payloadData);
      this.contractServices.createCampaign({
        title: payloadData.campaignTitle,
        description: payloadData.campaignDescription,
        imgUrl: environment.ipfsPubUrl + payloadData.campaignImage,
        pdfUrl: environment.ipfsPubUrl + payloadData.campaignDocument,
        minAmount: ethers.parseEther(payloadData.campaignMinimumInvestment!.toString()),
        maxAmount: ethers.parseEther(payloadData.campaignMaximumInvestment!.toString()),
        fundingType: payloadData.campaignFundingType,
        category: payloadData.campaignCategory,
        deadline: Math.floor(new Date(payloadData.campaignDeadline!).getTime() / 1000)
      }).then(async (data)=>{
        console.log("Campaign created successfully",data?.campaignAddress);
       const cData = await this.contractServices.getCampaignData(data?.campaignAddress);
       console.log(cData,"data")
        const storedData= {
          campaignAddress : data?.campaignAddress,
          title : payloadData.campaignTitle,
          description : payloadData.campaignDescription,
          imgUrl: environment.ipfsPubUrl + payloadData.campaignImage,
          pdfUrl: environment.ipfsPubUrl + payloadData.campaignDocument,
          owner : cData.owner,
          minAmount : payloadData.campaignMinimumInvestment,
          maxAmount : payloadData.campaignMaximumInvestment, 
          category :  payloadData.campaignCategory?.toUpperCase(),
          deadline : Number(cData.deadline),
          graceDays : Number(cData.graceDays),
          fundingType : payloadData.campaignFundingType,
          status : Number(cData.status)
        }
        console.log(storedData,"storedData..............");
        this.apiServices.createCampaign(storedData).subscribe(
          {
            next :(response)=>{
              console.log(response,"response from api after creating campaing");
            this.loading.set(false);
            if(response.success){
              this.toast.success("Success","Campaign created successfully");
              console.log(response?.data);
              this.router.navigate(['/explorer']);
              
            }
          },
          error : (err)=>{
            this.loading.set(false);
            console.log("Error storing campaign data in backend",err);
            this.toast.error("Error","Campaign created on blockchain but failed to store data in backend");
          }
          },
      );
        // this.router.navigate(['/explorer']);
        // return;
        // const uid = `${this.walletState.address}_${this.walletState.chainId}`;
        // console.log(uid,"uid for firebase");
        //   await this.firebase.addUserCampaign(uid, addr);
        // const data = await this.firebase.getUserData(uid)
        // .pipe(take(1))
        // .subscribe((data)=>{
          // console.log(data,"userdata from fb after creating campaing");
          // if(!data) {
          //   this.firebase.createUserData({
          //       uid : uid,
          //       walletAddress : this.walletState.address as string,
          //       chainId : this.walletState.chainId as number,
          //       totalRaised: 0,
          //       totalBackers : 0,
          //       totalSuccess : 0,
          //       totalFailed : 0,
          //       campaigns : [addr],
          //       activeCampaigns : 1,
          //       totalCampaign : 1
          //    })
          // }else {
          //   this.firebase.updateUserData(uid,{
          //     totalCampaign : data['totalCampaign'] + 1,
          //     activeCampaigns : data['activeCampaigns'] + 1,
          //     campaigns : [...data['campaigns'] , addr]
          //   })
          // }
        // })
      }
      ).catch((err)=>{
        console.log("Error creating campaign",err);
        this.loading.set(false);
      });
      
    }else{
      console.log("Form is invalid",this.myForm.errors ,this.myForm.value , this.myForm.valid)
    }
  }
  
  cancelForm(){
    console.log("cancel form");
    this.router.navigate(['/']);
  }
  // async uploadIpfs(){
  //    try {
      
  //      const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2ZDk5M2QwZC01OTM2LTQ0ZWItYTE5YS1jY2YyY2Y5ZjIwYWMiLCJlbWFpbCI6ImJoYXJhdGgwNC5kZXZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjA2MWUxYmRmZGFhNDU4NmUyYzQxIiwic2NvcGVkS2V5U2VjcmV0IjoiNTYwZThjMmUyMDkxYzBhMThiNmYwNzU0NDQyYzJhMjMwYzA1OTFlYjY4Mjk1Yzk2ZWM2MjMyNzRjNTE3NzEwMCIsImV4cCI6MTc5NjU2NzkzM30.V0THS0bEWywkq3l27dsXjjTsB3cvCEZ3aRRlVM7cQ0s";
  //     console.log("uploading ......",this.myForm.value.campaignImage);
  //     if(!this.myForm.value.campaignImage){
  //       console.log("No file selected for upload");
  //       return;
  //     }
  //      const file:File = this.myForm.value.campaignImage
  //      const formData = new FormData();
  //      formData.append("file", file);
  //      formData.append("network", "public");
 
  //      const request = await fetch("https://uploads.pinata.cloud/v3/files", {
  //        method: "POST",
  //        headers: {
  //          Authorization: `Bearer ${JWT}`,
  //        },
  //        body: formData,
       
  //      });
  //       const response = await request.json();
  //       if(response && response?.data && response.data?.cid){
  //         return {status : true, cid: response.data.cid};
  //       }else throw new Error("Invalid response from IPFS upload");
       
  //    } catch (error:any) {
  //       return {status : false, error: error.message || 'IPFS upload failed'};
  //    }
  // }


}


// 061e1bdfdaa4586e2c41
// 560e8c2e2091c0a18b6f0754442c2a230c0591eb68295c96ec623274c5177100
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2ZDk5M2QwZC01OTM2LTQ0ZWItYTE5YS1jY2YyY2Y5ZjIwYWMiLCJlbWFpbCI6ImJoYXJhdGgwNC5kZXZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjA2MWUxYmRmZGFhNDU4NmUyYzQxIiwic2NvcGVkS2V5U2VjcmV0IjoiNTYwZThjMmUyMDkxYzBhMThiNmYwNzU0NDQyYzJhMjMwYzA1OTFlYjY4Mjk1Yzk2ZWM2MjMyNzRjNTE3NzEwMCIsImV4cCI6MTc5NjU2NzkzM30.V0THS0bEWywkq3l27dsXjjTsB3cvCEZ3aRRlVM7cQ0s