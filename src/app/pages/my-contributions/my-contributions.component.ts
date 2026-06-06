// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-my-contributions',
//   imports: [],
//   templateUrl: './my-contributions.component.html',
//   styleUrl: './my-contributions.component.css'
// })
// export class MyContributionsComponent {

// }
import { CommonModule, CurrencyPipe, DatePipe, NgClass, PercentPipe } from '@angular/common';
import { Component } from '@angular/core';

type CampaignStatus = 'Active' | 'Successful' | 'Failed';
type ContributionFilter = 'All' | CampaignStatus;

interface ContributionItem {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  amountContributed: number;
  contributionDate: string; // ISO
  campaignRaised: number;
  campaignGoal: number;
  campaignStatus: CampaignStatus;
}

@Component({
  selector: 'app-my-contributions',
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe, DatePipe, PercentPipe],
  templateUrl: './my-contributions.component.html'
})
export class MyContributionsComponent {
  selectedFilter: ContributionFilter = 'All';

  contributions: ContributionItem[] = [
    {
      id: 'ctr-001',
      campaignId: 'cmp-101',
      campaignTitle: 'Clean Water for Rural Villages',
      campaignImage:
        'https://images.unsplash.com/photo-1541976076758-347942db197b?auto=format&fit=crop&w=1200&q=80',
      amountContributed: 120,
      contributionDate: '2026-01-18',
      campaignRaised: 18200,
      campaignGoal: 25000,
      campaignStatus: 'Active'
    },
    {
      id: 'ctr-002',
      campaignId: 'cmp-102',
      campaignTitle: 'School Supplies for 1,000 Kids',
      campaignImage:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      amountContributed: 250,
      contributionDate: '2025-12-10',
      campaignRaised: 40000,
      campaignGoal: 40000,
      campaignStatus: 'Successful'
    },
    {
      id: 'ctr-003',
      campaignId: 'cmp-103',
      campaignTitle: 'Emergency Medical Aid Fund',
      campaignImage:
        'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
      amountContributed: 75,
      contributionDate: '2025-11-02',
      campaignRaised: 9200,
      campaignGoal: 20000,
      campaignStatus: 'Failed'
    },
    {
      id: 'ctr-004',
      campaignId: 'cmp-104',
      campaignTitle: 'Women Artisan Support Program',
      campaignImage:
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      amountContributed: 180,
      contributionDate: '2026-02-01',
      campaignRaised: 14600,
      campaignGoal: 18000,
      campaignStatus: 'Active'
    }
  ];

  get filteredContributions(): ContributionItem[] {
    if (this.selectedFilter === 'All') return this.contributions;
    return this.contributions.filter((item) => item.campaignStatus === this.selectedFilter);
  }

  get totalDonated(): number {
    return this.contributions.reduce((sum, item) => sum + item.amountContributed, 0);
  }

  get campaignsBacked(): number {
    return new Set(this.contributions.map((item) => item.campaignId)).size;
  }

  get activeCampaignsSupported(): number {
    return new Set(
      this.contributions
        .filter((item) => item.campaignStatus === 'Active')
        .map((item) => item.campaignId)
    ).size;
  }

  get successfulCampaignsSupported(): number {
    return new Set(
      this.contributions
        .filter((item) => item.campaignStatus === 'Successful')
        .map((item) => item.campaignId)
    ).size;
  }

  progress(item: ContributionItem): number {
    if (!item.campaignGoal) return 0;
    return Math.max(0, Math.min(1, item.campaignRaised / item.campaignGoal));
  }

  statusBadgeClass(status: CampaignStatus): string {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'Successful':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      default:
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
    }
  }

  viewReceipt(item: ContributionItem): void {
    // Replace with real navigation/download action later.
    console.log(`View receipt for contribution ${item.id}`);
  }
}
