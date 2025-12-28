import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ContractService } from '../../services/contract.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ethers } from 'ethers';
import { ToastModule } from 'primeng/toast'; 
import { MessageService } from 'primeng/api';
import { Ripple } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';

interface Campaign {
  id: number;
  title: string;
  description: string;
  // fullDescription: string;
  image: string;
  pdf : string;
  owner : string;
  category: string;
  raised: number;
  goal: number;
  minAmount: number;
  backers: number;
  daysLeft: number;
  fundingType: number;
  status: number;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  amount: number;
  estimatedDelivery: string;
  backers: number;
  limited: boolean;
  limit?: number;
}

interface Update {
  id: number;
  title: string;
  content: string;
  date: string;
  likes: number;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-campaign',
  standalone: true,
  imports: [CommonModule,ToastModule,Ripple,ButtonModule],
  providers: [MessageService],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css']
})
export class CampaignComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);
  public contractService = inject(ContractService);
  private sanitizer = inject(DomSanitizer);
  readonly currentTheme = this.themeService.theme;
  constructor(private messageService: MessageService) {}
// private messageService = inject(MessageService);
  isPdfLoading = signal<boolean>(true);
  // Campaign data signal
  readonly campaign = signal<Campaign | null>(null);

  // Active tab signal
  readonly activeTab = signal<'PDF' | 'updates' | 'faqs'>('PDF');

  private readonly sampleCampaigns: Campaign | null = null;
  async ngOnInit() {

    this.fetchCampaignData();
   
  }
   showSuccess() {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Message Content' });
    }

  async fetchCampaignData() {
    const campaignAddress = this.route.snapshot.queryParamMap.get('id') ?? null;
    if (campaignAddress) {
      console.log('Campaign address from query params:', campaignAddress);
      const campaignData = await  this.contractService.getCampaignData(campaignAddress);
      console.log(campaignData,"campaignDatacampaignDatacampaignData");
      
      if (campaignData){
        const campaign: Campaign = {
          id: 0,
          title: campaignData.title,
          description: campaignData.description,
          image: campaignData.imageUrl,
          pdf : campaignData.pdfUrl,
          owner : campaignData.owner,
          raised : parseInt(ethers.formatEther(campaignData.totalInvested)),
          goal : parseInt(ethers.formatEther(campaignData.maxAmount)),
          minAmount : parseInt(ethers.formatEther(campaignData.minAmount)),
          backers : Number(campaignData.totalInvestors),
          category : campaignData.category.toUpperCase(),
          daysLeft : this.calculateDaysLeft(Number(campaignData.deadline)),
          fundingType : Number(campaignData.fundingType),
          status :Number(campaignData.status)
        }
        this.isPdfLoading.set(false);
        console.log(campaign,"need campaignDAta");
        this.campaign.set(campaign);
      }else {
        this.router.navigate(['**']);
      }
    } else {
      console.log('No campaign address provided in query params.');
      this.router.navigate(['**']);
    }
  }

   private calculateDaysLeft(deadline: number): number {
    const now = Date.now();
    const end = deadline * 1000;
    return Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
  }

  getSafePdfUrl(pdf: string) {
  return this.sanitizer.bypassSecurityTrustResourceUrl(pdf);
}
// onAmountInput(input: HTMLInputElement) {
//   let value = Number(input.value);

//   if (isNaN(value)) {
//     input.value = '';
//     return;
//   }
//   const campaign = this.campaign();
//   if (!campaign) return;
//   if (value < campaign?.minAmount) {
//     input.value = campaign?.minAmount.toString();
//   }

//   if (value > campaign?.goal) {
//     input.value = (campaign?.goal - campaign?.raised).toString();
//   }
// }
isFundingDisabled(amount: string): boolean {
  const value = Number(amount);

  if (isNaN(value)) return true;
const campaign = this.campaign();
if (!campaign) return true;
const remainingAmount = campaign.goal - campaign.raised;
  return (
    value < campaign.minAmount ||
    value > remainingAmount
  );
}
  // Methods
  setActiveTab(tab: 'PDF' | 'updates' | 'faqs') {
    this.activeTab.set(tab);
  }

  getProgressPercentage(): number {
    const campaign = this.campaign();
    if (!campaign) return 0;
    return Math.min((campaign.raised / campaign.goal) * 100, 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  backProject(reward: Reward) {
    // Navigate to pledge page or open modal
    console.log('Backing project with reward:', reward);
  }

  shareCampaign() {
    if (navigator.share) {
      navigator.share({
        title: this.campaign()?.title,
        text: this.campaign()?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  goBack() {
    this.router.navigate(['/explorer']);
  }

  doFunding(amt: string) {
    const value = Number(amt);
    console.log(value,"amountamountamount");
    const campaign = this.campaign();
    if (!campaign) return ;
    const remainingAmount = campaign.goal - campaign.raised;
      
     if( value < campaign.minAmount || value > remainingAmount){
      console.log("condi true");
      
// this.messageService.add({severity:'success', summary:'Success', detail:'Wallet connected!'});    
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Message Content' });

     return;
    }
      
  }

  ngDestroy() {
    localStorage.removeItem('selectedCampaign');
  }
}