import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ContractService } from '../../services/contract.service';
import { ethers } from 'ethers';

interface Campaign {
  id: number;
  address: string;
  title: string;
  description: string;
  image: string;
  category: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  creator: string;
}
// interface Campaign {
//   id: number;
//   title: string;
//   description: string;
//   image: string;
//   pdf: string;
//   minmumInvestment: number;
//   maximumInvestment: number;
//   fundingType: string;
//   category: string;
//   deadline: string;
//   owner : string;
//   raised: number;
//   goal: number;
//   backers: number;
//   daysLeft: number;
//   creator: string;
// }

@Component({
  selector: 'app-explore-campaign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-campaign.component.html',
  styleUrls: ['./explore-campaign.component.css']
})
export class ExploreCampaignComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  loading = signal<boolean>(true);

    // Sample campaigns data
  readonly campaigns = signal<Campaign[]>([]);
  constructor(private contractService: ContractService) { }

  async ngOnInit() {
      this.loading.set(true);

    try {
      const campaignLists = await this.contractService.getAllCampaigns();
      console.log(campaignLists,"campaignLists");
      const mappedCampaigns: Campaign[] = [];
      for(let el of campaignLists){
          const data = await this.contractService.getCampaignData(el);
          const campaignData = {
            id: mappedCampaigns.length, // or index
            address : el,
            title : data.title,
            description : data.description,
            image : data.imageUrl,
            pdf : data.pdfUrl,
            raised :parseInt(ethers.formatEther(data.totalInvested)),
            goal :parseInt(ethers.formatEther(data.maxAmount)),
            backers : Number(data.totalInvestors),
            daysLeft : this.calculateDaysLeft(Number(data.deadline)),
            minmumInvestment : Number(data.minAmount),
            maximumInvestment : Number(data.maxAmount),
            fundingType : Number(data.fundingType),
            category :  data.category.toUpperCase(),
            deadline : new Date(Number(data.deadline) * 1000).toLocaleDateString(),
            creator : data.owner,
            status  : Number(data.status),
          }
          console.log(campaignData,"campaign data");
        mappedCampaigns.push(campaignData);
      }
      console.log(mappedCampaigns,"mappedCampaigns");
      
      this.campaigns.set(mappedCampaigns);
    } catch (error) {
       console.error(error);
    } finally {
        this.loading.set(false);
    }
  }
  readonly currentTheme = this.themeService.theme;



  // Categories for filtering
  readonly categories = signal<string[]>([
    'All',
    'Technology',
    'Community',
    'Education',
    'Environment',
    'Health',
    'Business'
  ]);

  readonly selectedCategory = signal<string>('All');

  // Computed signal for filtered campaigns
  readonly filteredCampaigns = computed(() => {
    const category = this.selectedCategory();
    if (category === 'All') {
      return this.campaigns();
    }
    return this.campaigns().filter(campaign => campaign.category === category);
  });

  // Methods
  
  private calculateDaysLeft(deadline: number): number {
    const now = Date.now();
    const end = deadline * 1000;
    return Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
  }

  
  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  viewCampaign(address: string) {
    console.log(address,"campaginid");
    this.router.navigate(['/campaign'],{
      queryParams: { id: address }
    });
  }

  getProgressPercentage(campaign: Campaign): number {
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}