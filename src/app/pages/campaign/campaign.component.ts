import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ContractService } from '../../services/contract.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ethers } from 'ethers';

interface Campaign {
  id: number;
  title: string;
  description: string;
  // fullDescription: string;
  image: string;
  pdf : string;
  category: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  // creator: {
  //   name: string;
  //   avatar: string;
  //   bio: string;
  //   location: string;
  //   projects: number;
  // };
  // rewards: Reward[];
  // updates: Update[];
  // faqs: FAQ[];
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
  imports: [CommonModule],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css']
})
export class CampaignComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);
  private contractService = inject(ContractService);
  private sanitizer = inject(DomSanitizer);
  readonly currentTheme = this.themeService.theme;
// public pdfUrl:string = "https://ipfs.io/ipfs/bafkreigy2s4bfabvw22e4arj777wprtbvmb65oc5z3fzufe6za3bkchyca"

  pdfUrl!: SafeResourceUrl;
  isPdfLoading = signal<boolean>(true);
  // Campaign data signal
  readonly campaign = signal<Campaign | null>(null);

  // Active tab signal
  readonly activeTab = signal<'PDF' | 'updates' | 'faqs'>('PDF');

  // Sample campaign data
  private readonly sampleCampaigns: Campaign | null = null;
  async ngOnInit() {
    // const id =  1 //Number(this.route.snapshot.paramMap.get('id'));
    // const campaign = this.sampleCampaigns.find(c => c.id === id);

    // if (campaign) {
    //   this.campaign.set(campaign);
    // } else {
    //   // Handle campaign not found
    //   this.router.navigate(['/explore']);
    // }
    this.fetchCampaignData();
   
  }

  async fetchCampaignData() {
    const campaignAddress = this.route.snapshot.queryParamMap.get('id') ?? null;
    if (campaignAddress) {
      console.log('Campaign address from query params:', campaignAddress);
      const campaignData = await  this.contractService.getCampaignData(campaignAddress);
      if (campaignData){
        const campaign: Campaign = {
          id: 0,
          title: campaignData.title,
          description: campaignData.description,
          image: campaignData.imageUrl,
          pdf : campaignData.pdfUrl,
          raised : parseInt(ethers.formatEther(campaignData.totalInvested)),
          goal : parseInt(ethers.formatEther(campaignData.maxAmount)),
          backers : Number(campaignData.totalInvestors),
          category : campaignData.category.toUpperCase(),
          daysLeft : this.calculateDaysLeft(Number(campaignData.deadline)),
        }
        this.isPdfLoading.set(false);
        console.log(campaignData.pdfUrl,"campaignData by address", this.isPdfLoading);
        this.campaign.set(campaign);
          // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(campaignData.pdfUrl);
      }else {
        this.router.navigate(['**']);
      }
    } else {
      // Handle missing address
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
  ngDestroy() {
    localStorage.removeItem('selectedCampaign');
  }
}