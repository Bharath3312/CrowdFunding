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
  totalPage?:number;
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
            this.totalPage = res.data?.pagination?.totalPages
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
            //  campaign.push({
            //       id: 'cmp-002',
            //       title: 'Community Skill Hub',
            //       description:
            //         'A digital + offline training center for youth to learn job-ready skills in design, coding, and freelancing.',
            //       imageUrl:
            //         'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
            //       raised: 32000,
            //       goal: 30000,
            //       daysLeft: 0,
            //       backers: 412,
            //       status: 'Successful'
                
            //  })
            //  campaign.push({
            //     id: 'cmp-001',
            //     title: 'Solar Water for Rural Schools',
            //     description:
            //       'Installing low-cost solar-powered water purifiers in underserved village schools to improve child health.',
            //     imageUrl:
            //       'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
            //     raised: 18500,
            //     goal: 25000,
            //     daysLeft: 18,
            //     backers: 243,
            //     status: 'Active'
            //  })
            //  campaign.push(
            //   {
            //     id: 'cmp-003',
            //     title: 'Emergency Medical Transport',
            //     description:
            //       'Funding one ambulance van and first-response kits to reduce delays in critical emergencies.',
            //     imageUrl:
            //       'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
            //     raised: 9800,
            //     goal: 20000,
            //     daysLeft: 0,
            //     backers: 121,
            //     status: 'Failed'
            //   },
            //  )
            if(this.page ===1 ){
              this.campaigns.set(campaign)
            }else{
             this.campaigns.update(prev => [...prev, ...campaign]);
            }
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
      this.page = 1;
      this.getCampaigns();
    }
   }
   statusToString(status:number): CampaignStatus{
    if([0,1].includes(status)) return "Active"
    else if([2,4].includes(status)) return "Successful"
    else return "Failed"
   }
   loadMore(){
      if(this.totalPage && this.page >= this.totalPage) return 
      this.page += 1;
      this.getCampaigns()
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
