import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { FirebaseService } from '../../services/firebase.service';
import { ContractService } from '../../services/contract.service';
import { ethers } from 'ethers';
import { EvmWalletServices } from '../../services/evm-wallet.services';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletState } from '../../models/wallet-provider.model';
import { ToastService } from '../../services/toast.service';
interface Campaign {
  id: string;
  title: string;
  category: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'draft';
  progress: number;
}

interface Activity {
  id: string;
  type: 'contribution' | 'milestone' | 'update' | 'backer';
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
  user?: string;
}

interface StatCard {
  title: string;
  value: string | number;
  // change: number;
  // changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private firebase = inject(FirebaseService);
  private contractServices = inject(ContractService);
  private walletServices = inject(EvmWalletServices);
  private toast = inject(ToastService);

  walletState : WalletState = this.walletServices.walletState$.getValue();
  wallet$ = toSignal(
    this.walletServices.walletState$Observable,
    { initialValue: this.walletServices.walletState$.getValue() }
  )
  constructor(){
    
    effect(() => {
      const state  = this.wallet$();
      console.log(state,"wallet state in dashboard component");
      if(!state.isConnected){
        this.toast.error('Error','Please connect your wallet to access the dashboard');
        this.router.navigate(['/']);
      }else {
        this.walletState = state;
        this.loading.set(true);
        this.getUserData();   
      }
    })
  }
  // Reactive theme state
  readonly isDarkMode = this.themeService.isDarkMode;
  loading = signal<boolean>(false);
  
  // Dashboard data signals
  userData = signal<{totalRaised: number, activeCampaigns: number, totalBackers: number,totalSuccess: number,totalCampaign: number}>({
    totalRaised: 0,
    activeCampaigns: 0,
    totalBackers: 0,
    totalSuccess: 0,
    totalCampaign: 0
  });
  stats = computed<StatCard[]>(() => [
    {
      title: 'Total Raised',
      value: `$${this.userData().totalRaised}`,
      // change: 0,
      // changeType: 'positive',
      icon: '💰 '
    },
    {
      title: 'Active Campaigns',
      value: this.userData().activeCampaigns,
      // change: 2,
      // changeType: 'positive',
      icon: '🚀'
    },
    {
      title: 'Total Backers',
      value: this.userData().totalBackers,
      // change: -3.2,
      // changeType: 'negative',
      icon: '👥'
    },
    {
      title: 'Success Rate',
      value: this.userData().totalCampaign > 0 ? `${Math.round((this.userData().totalSuccess / this.userData().totalCampaign) * 100)}%` : '0%',
      // change: 5.1,
      // changeType: 'positive',
      icon: '📈'
    }
  ]);
  

  campaigns = signal<Campaign[]>([]);
  readonly recentActivity = signal<Activity[]>([
    {
      id: '1',
      type: 'contribution',
      title: 'New Contribution',
      description: 'John Doe contributed $250 to Sustainable Energy Revolution',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      amount: 250,
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'milestone',
      title: 'Milestone Reached',
      description: 'Community Garden Network reached 75% of its goal',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: '3',
      type: 'backer',
      title: 'New Backer',
      description: 'Sarah Wilson joined as a backer for Educational VR Platform',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: 'Sarah Wilson'
    },
    {
      id: '4',
      type: 'update',
      title: 'Campaign Update',
      description: 'Local Art Collective posted a new update',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    }
  ]);

  // Computed signals
  readonly totalRaised = computed(() =>
    this.campaigns().reduce((sum, campaign) => sum + campaign.raised, 0)
  );

  readonly activeCampaigns = computed(() =>
    this.campaigns().filter(campaign => campaign.status === 'active')
  );

  readonly completedCampaigns = computed(() =>
    this.campaigns().filter(campaign => campaign.status === 'completed')
  );

  ngOnInit() {  
      // this.getUserData();
  }

  // Helper methods
  getStatusColor(status: Campaign['status']): string {
    switch (status) {
      case 'active': return 'var(--accent-green)';
      case 'completed': return 'var(--accent-blue)';
      case 'draft': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  }

  getActivityIcon(type: Activity['type']): string {
    switch (type) {
      case 'contribution': return '💰';
      case 'milestone': return '🎯';
      case 'update': return '📝';
      case 'backer': return '👤';
      default: return '📌';
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  async getUserData() {
    //  const user = await this.firebase.getUserData(`${this.walletState.address}_${this.walletState?.chainId}`)
        
    //  this.userData.set({
    //       totalRaised: user?.['totalRaised'] || 0,
    //       activeCampaigns: user?.['activeCampaigns'] || 0,
    //       totalBackers: user?.['totalBackers'] || 0,
    //       totalSuccess: user?.['totalSuccess'] || 0,
    //       totalCampaign: user?.['campaigns'].length || 0,
    //   });
    //   if(user?.['campaigns']?.length){
    //       this.getCampaignsData(user?.['campaigns'] || []);
    //   }else{
    //     this.campaigns.set([]);
    //     this.loading.set(false);
    //   }
  }

  async getCampaignsData(campaigns: string[]) {
    // Get last 4 campaigns safely
   try {
     const lastFour = campaigns.slice(-4).reverse(); 
     const filterdCampaigns: Campaign[] = [];
     const calculateDaysLeft = (deadline: number): number =>{
       const now = Date.now();
       const end = deadline * 1000;
       return Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
     }
     for (const addr of lastFour) {
       console.log('Latest Campaign address:', addr);
       const campaignData = await this.contractServices.getCampaignData(addr);
       const status = Number(campaignData.status);
       const campaign = {
         id: filterdCampaigns.length.toString(), // or use addr for unique id
         title: campaignData.title,
         category: campaignData.category.toUpperCase(),
         goal: parseInt(ethers.formatEther(campaignData.maxAmount)),
         raised: parseInt(ethers.formatEther(campaignData.totalInvested)),
         backers: campaignData.totalInvestors.length ?? 0,
         daysLeft: calculateDaysLeft(Number(campaignData.deadline)),
         status: [0,1].includes(status) ? 'active' : [2,4].includes(status) ? 'completed' : 'draft',
         progress : 0
       }
       campaign.progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
       filterdCampaigns.push(campaign as Campaign); ;
      //  console.log('Campaign data:', campaign);
     }
     if(filterdCampaigns.length) this.campaigns.set(filterdCampaigns);
     this.loading.set(false);
   } catch (error) {
     console.error('Error fetching campaign data:', error);
     this.loading.set(false);
   }

  }




}