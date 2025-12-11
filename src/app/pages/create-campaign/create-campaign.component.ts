import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup,FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IpfsServciesService } from '../../services/ipfs.servcies.service';
import { ContractService } from '../../services/contract.service';
@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css']
})
export class CreateCampaignComponent {

 constructor(private ipfsService : IpfsServciesService,private contractServices :  ContractService){}

  myForm = new FormGroup({
    campaignTitle: new FormControl('',Validators.required),
    campaignDescription: new FormControl('',Validators.required), 
    campaignImage: new FormControl(null as File | null,Validators.required),
    campaignDocument: new FormControl(null as File | null,Validators.required),
    campaignMinimumInvestment: new FormControl('',Validators.required),
    campaignMaximumInvestment: new FormControl('',Validators.required),
    campaignDeadline: new FormControl('',Validators.required),
    campaignFundingType: new FormControl('',Validators.required),
    campaignCategory: new FormControl('',Validators.required),
  })
   ngOnInit(): void {
    // this.uploadIpfs()
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
      const getImgIpfsHash = await this.ipfsService.uploadToIpfs(this.myForm.value.campaignImage);
      if(!getImgIpfsHash.status){
        console.log("Image upload to IPFS failed", getImgIpfsHash.error);
        return;
      }
      const getPdfIpfsHash = await this.ipfsService.uploadToIpfs(this.myForm.value.campaignDocument);
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
      
    }else{
      console.log("Form is invalid",this.myForm.errors ,this.myForm.value , this.myForm.valid)
    }
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