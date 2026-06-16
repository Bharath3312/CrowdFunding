// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-my-campaigns',
//   imports: [],
//   templateUrl: './my-campaigns.component.html',
//   styleUrl: './my-campaigns.component.css'
// })
// export class MyCampaignsComponent {

// }


import { CommonModule, CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service';

type CampaignStatus = 'Active' | 'Successful' | 'Failed';
type CampaignFilter = 'All' | CampaignStatus;

interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raised: number;
  goal: number;
  daysLeft: number;
  backers: number;
  status: CampaignStatus;
}

@Component({
  selector: 'app-my-campaigns',
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe, DecimalPipe],
  templateUrl: './my-campaigns.component.html'
})
export class MyCampaignsComponent {
  selectedFilter: CampaignFilter = 'All';
  apiServices = inject(ApiServiceService);
  campaigns: Campaign[] = [
    {
      id: 'cmp-001',
      title: 'Solar Water for Rural Schools',
      description:
        'Installing low-cost solar-powered water purifiers in underserved village schools to improve child health.',
      imageUrl:
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
      raised: 18500,
      goal: 25000,
      daysLeft: 18,
      backers: 243,
      status: 'Active'
    },
    {
      id: 'cmp-002',
      title: 'Community Skill Hub',
      description:
        'A digital + offline training center for youth to learn job-ready skills in design, coding, and freelancing.',
      imageUrl:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
      raised: 32000,
      goal: 30000,
      daysLeft: 0,
      backers: 412,
      status: 'Successful'
    },
    {
      id: 'cmp-003',
      title: 'Emergency Medical Transport',
      description:
        'Funding one ambulance van and first-response kits to reduce delays in critical emergencies.',
      imageUrl:
        'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
      raised: 9800,
      goal: 20000,
      daysLeft: 0,
      backers: 121,
      status: 'Failed'
    },
    {
      id: 'cmp-004',
      title: 'Women Artisan Marketplace',
      description:
        'Helping local women artisans sell handmade products online through branding, cataloging, and logistics.',
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
      raised: 14600,
      goal: 18000,
      daysLeft: 9,
      backers: 198,
      status: 'Active'
    },
    {
      id: 'cmp-005',
      title: 'School Nutrition Drive',
      description:
        'Nutritious weekly meal support for children in drought-affected regions with local supply partnerships.',
      imageUrl:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      raised: 42000,
      goal: 40000,
      daysLeft: 0,
      backers: 506,
      status: 'Successful'
    }
  ];

   ngOnInit(){
      this.apiServices.get_myCampaigns().subscribe({
        next :(res)=>{
          console.log(res,"mycampaigns");
        },
        error :(err)=>{
          console.log(err,"err");
        }
      })
   }

  get filteredCampaigns(): Campaign[] {
    if (this.selectedFilter === 'All') return this.campaigns;
    return this.campaigns.filter((c) => c.status === this.selectedFilter);
  }

  get totalCampaigns(): number {
    return this.campaigns.length;
  }

  get activeCampaigns(): number {
    return this.campaigns.filter((c) => c.status === 'Active').length;
  }

  get successfulCampaigns(): number {
    return this.campaigns.filter((c) => c.status === 'Successful').length;
  }

  get totalRaised(): number {
    return this.campaigns.reduce((sum, c) => sum + c.raised, 0);
  }

  progressPercent(campaign: Campaign): number {
    if (!campaign.goal) return 0;
    return Math.max(0, Math.min(100, (campaign.raised / campaign.goal) * 100));
  }

  badgeClasses(status: CampaignStatus): string {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'Successful':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Failed':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  }
}
