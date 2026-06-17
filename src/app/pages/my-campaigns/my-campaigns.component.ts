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
import { Component, inject, signal } from '@angular/core';
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
  campaigns = signal<Campaign[]>([]);
  totalCampaigns:number = 0;
  activeCampaigns:number =0;
  successfulCampaigns:number =0;
  failedCampaigns:number =0;
  totalRaised:number=0;
  totalBackers:number = 0;
  page:number =1;
   ngOnInit(){
     this.getCampaigns();
   }
   getCampaigns(){

       this.apiServices.get_myCampaigns(this.page,this.selectedFilter).subscribe({
        next :(res)=>{
          console.log(res,"mycampaigns");
          if(res?.success && res?.data){
            this.totalCampaigns = res?.data?.totalCampaignCount;
            this.activeCampaigns = res.data?.activeCount;
            this.successfulCampaigns = res.data?.successCount;
            this.failedCampaigns = res.data?.failedCount;
            this.totalRaised = res.data?.totalRaised;
            this.totalBackers = res.data?.totalBackers;
              const campaign: Campaign[] = res.data.campaignList.map((item:any)=>({
                id : item._id,
                title : item.title,
                description : item.description,
                imageUrl : item.img_url,
                raised : item.total_funded,
                goal : item.max_amount,
                daysLeft : this.calculateDaysLeft(new Date(item.campaign_end_date).getTime() / 1000),
                backers : item.total_investors,
                status : this.statusToString(item.status)
              }));
             
              this.campaigns.set(campaign)
          }
          console.log(this.campaigns,"all campaigns");
          
        },
        error :(err)=>{
          console.log(err,"err");
        }
      })
   }
   filteredCampaigns(value :CampaignStatus) {
    console.log(value,"by filetered");
    if(value != this.selectedFilter){
      this.selectedFilter = value;
      this.getCampaigns();
    }
   }
   statusToString(status:number): CampaignStatus{
    if([0,1].includes(status)) return "Active"
    else if([2,4].includes(status)) return "Successful"
    else return "Failed"
   }
  // get filteredCampaigns(): Campaign[] {
  //   if (this.selectedFilter === 'All') return this.campaigns;
  //   return this.campaigns.filter((c) => c.status === this.selectedFilter);
  // }

  // get totalCampaigns(): number {
  //   return this.campaigns.length;
  // }

  // get activeCampaigns(): number {
  //   return this.campaigns.filter((c) => c.status === 'Active').length;
  // }

  // get successfulCampaigns(): number {
  //   return this.campaigns.filter((c) => c.status === 'Successful').length;
  // }

  // get totalRaised(): number {
  //   return this.campaigns.reduce((sum, c) => sum + c.raised, 0);
  // }

  progressPercent(campaign: Campaign): number {
    if (!campaign.goal) return 0;
    return Math.max(0, Math.min(100, (campaign.raised / campaign.goal) * 100));
  }

  private calculateDaysLeft(deadline: number): number {
    const now = Date.now();
    const end = deadline * 1000;
    return Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
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
