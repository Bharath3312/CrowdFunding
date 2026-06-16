import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ContractService } from '../../services/contract.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ethers } from 'ethers';
import { ToastModule } from 'primeng/toast'; 
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../services/toast.service';
import { FirebaseService } from '../../services/firebase.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { EvmWalletServices } from '../../services/evm-wallet.services';
import { WalletState } from '../../models/wallet-provider.model';
import { ApiServiceService } from '../../services/api-service.service';
import { firstValueFrom } from 'rxjs';
interface Campaign {
  id: string;
  title: string;
  description: string;
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
  votingRaised : number
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
  imports: [CommonModule,ToastModule,ButtonModule],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css']
})
export class CampaignComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);

  private firebase  = inject(FirebaseService)
  public contractService = inject(ContractService);
  private walletServices =  inject(EvmWalletServices)
  private apiService = inject(ApiServiceService);
  readonly currentTheme = this.themeService.theme;
  isPdfLoading = signal<boolean>(true);
  campaignAddress: string | null = null;

  readonly campaign = signal<Campaign | null>(null);
  readonly backers = signal<{address: string, value : number}[]>([]);
  readonly votingResults = signal<{amount : number; yes: number; no: number; status: number}[]>([]);
  readonly activeTab = signal<'PDF' | 'updates' | 'faqs'>('PDF');

  readonly myCurrentVoteStatus = signal<boolean>(false);

  walletState : WalletState  = this.walletServices.walletState$.getValue();

  wallet$ = toSignal(
    this.walletServices.walletState$Observable,
    {initialValue : this.walletServices.walletState$.getValue()}
  )

  constructor(){
    effect(()=>{
      const state = this.wallet$();
      console.log(state,"wallet state in campaign page");
      if(this.walletState?.address != state.address) this.getCampaignData();
      this.walletState = state;
    })
  }
  async ngOnInit() {    
    // this.fetchCampaignData();    
    // this.fetCampaignDataByApi();
    this.getCampaignData();
  }

  async getCampaignData(){
    try {
        this.campaignAddress = this.route.snapshot.queryParamMap.get('id') ?? null;
        console.log('Campaign address from query params:', this.campaignAddress);
      if (!this.campaignAddress) throw new Error("")

        const campaignDataContract = await  this.contractService.getCampaignData(this.campaignAddress);
        console.log(campaignDataContract,"campaignDatacampaignDatacampaignData");
        if(!campaignDataContract) throw new Error()

        const apiData = await firstValueFrom(this.apiService.getCampaignById(this.campaignAddress as string));
        console.log(apiData,"api Data");
        if(!apiData || !apiData?.success || !apiData?.data) throw new Error();

        const campaignData = apiData.data;

        const campaign: Campaign = {
            id: campaignData._id,
            title: campaignData.title,
            description: campaignData.description,
            image: campaignData.img_url,
            pdf : campaignData.pdf_url,
            owner : campaignDataContract.owner,
            category: campaignData.category.toUpperCase(),
            raised:Number(campaignDataContract.status) <=2 ? parseInt(ethers.formatEther(campaignDataContract.totalInvested)) :campaignData.total_funded,
            goal: campaignData.max_amount,
            minAmount: campaignData.min_amount,
            backers: campaignData.total_investors,
            daysLeft: this.calculateDaysLeft(new Date(campaignData.campaign_end_date).getTime() / 1000),
            fundingType: campaignData.funding_type,
            votingRaised:  Number(campaignDataContract.totalRaisingVotes),  //campaignData?.totalRaisingVotes || 0,
            status:Number(campaignDataContract.status) , // campaignData.status
          }

          if(campaign?.raised > 0 &&campaignData?.investors.length){
              this.getBackers(campaignData.investors);
          }
          if(campaign.votingRaised > 0){
            this.getVotingResults(Number(campaign.votingRaised));
          }
          this.isPdfLoading.set(false);
          console.log(campaign,"need campaignDAta");
          this.checkAndUpdate(campaign.status)
          this.campaign.set(campaign);
          
    } catch (error) {
      console.log(error,"error from getcampaigndata");
        this.router.navigate(['**']);
    }
      
  }

  async fetCampaignDataByApi(){
    this.campaignAddress = this.route.snapshot.queryParamMap.get('id') ?? null;
    if (this.campaignAddress) {
      console.log('Campaign address from query params:', this.campaignAddress);
      this.apiService.getCampaignById(this.campaignAddress).subscribe({
        next : (res)=>{
          console.log(res,"campaign data from api");
          if(res.success && res.data){
            const campaignData = res.data;
            const campaign: Campaign = {
              id: campaignData._id,
              title: campaignData.title,
              description: campaignData.description,
              image: campaignData.img_url,
              pdf : campaignData.pdf_url,
              owner : campaignData.owner,
              category: campaignData.category.toUpperCase(),
              raised: campaignData.total_funded,
              goal: campaignData.max_amount,
              minAmount: campaignData.min_amount,
              backers: campaignData.total_investors,
              daysLeft: this.calculateDaysLeft(new Date(campaignData.campaign_end_date).getTime() / 1000),
              fundingType: campaignData.funding_type,
              votingRaised: campaignData?.totalRaisingVotes || 0,
              status: campaignData.status
            };
            if(campaignData?.investors.length){
              this.getBackers(campaignData.investors);
            }
            this.isPdfLoading.set(false);
            console.log(campaign,"need campaignDAta");
            this.campaign.set(campaign);
          }else this.router.navigate(['**']);
        },
        error : (err)=>{
          console.error(err,"error fetching campaign by id");
          this.router.navigate(['**']);
        }
      });
    }else this.router.navigate(['**']);
  }
  async fetchCampaignData() {
    this.campaignAddress = this.route.snapshot.queryParamMap.get('id') ?? null;
    if (this.campaignAddress) {
      console.log('Campaign address from query params:', this.campaignAddress);
      const campaignData = await  this.contractService.getCampaignData(this.campaignAddress);
      console.log(campaignData,"campaignDatacampaignDatacampaignData");
      
      if (campaignData){
        const campaign: Campaign = {
          id: "0",
          title: campaignData.title,
          description: campaignData.description,
          image: campaignData.imageUrl,
          pdf : campaignData.pdfUrl,
          owner : campaignData.owner,
          raised : parseInt(ethers.formatEther(campaignData.totalInvested)),
          goal : parseInt(ethers.formatEther(campaignData.maxAmount)),
          minAmount : parseInt(ethers.formatEther(campaignData.minAmount)),
          backers : 0 , //campaignData.totalInvestors.length ?? 0,
          category : campaignData.category.toUpperCase(),
          daysLeft : this.calculateDaysLeft(Number(campaignData.deadline)),
          fundingType : Number(campaignData.fundingType),
          votingRaised : Number(campaignData.totalRaisingVotes),
          status :Number(campaignData.status)
        }
        // if(campaignData.totalInvestors.length > 0){
        //   this.getBackers(campaignData.totalInvestors);
        // }
        if(campaignData.totalRaisingVotes > 0){
          this.getVotingResults(Number(campaignData.totalRaisingVotes));
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
  async getVotingResults(votingRaised : number)  {
    try {
      console.log(votingRaised,"votingRaisedvotingRaisedvotingRaised");
      this.votingResults.set([]);
      for(let i=votingRaised -1 ;i>= 0;i--){
        const voteData = await this.contractService.getVoteingResults(this.campaignAddress as string, i);
        console.log(voteData ,"voteData");
        const results = {
          amount : parseInt(ethers.formatEther(voteData.amount)),
          yes : Number(voteData.yesVotes),
          no :Number(voteData.noVotes),
          status :Number(voteData.status)
        }
        console.log(results,"resultssss",voteData);
        
        this.votingResults.update(votes => [...votes, results]);
      }
      const hasVoted = await this.contractService.hasVoted(this.votingResults().length -1 , this.walletState?.address  as string, this.campaignAddress as string);
      console.log(hasVoted);
      this.myCurrentVoteStatus.set(hasVoted);
      console.log(this.myCurrentVoteStatus,"mycurrentVote status");
      
     console.log(this.votingResults(),"voteData in loop");
      
    } catch (error) {
      console.error('Error fetching voting results:', error);
    }
  }
  async getBackers(investors : any){
    console.log(investors,"investorsinvestors");
      this.backers.set([]);
      for(const investor of investors){
        console.log(investor,"investorinvestor");
        this.backers.update(backers => [...backers, {address: investor.wallet_address, value: investor.amount}]);
      }
  }
  async getBackerss(investors: string[]) {
    try {
      // const backersData = [];/
      for (const investor of investors) {
        const userData = await this.contractService.getCampaignBackersAmt(this.campaignAddress as string, investor);
        // backersData.push({
        //   address: investor,
        //   name: userData?.['name'] || 'Anonymous',
        //   profileImage: userData?.['profileImage'] || 'assets/default-profile.png'
        // });
        this.backers.update(backers => [...backers, {address: investor, value: parseInt(ethers.formatEther(userData))}]);
      }
      console.log(this.backers(),"backersData");
      // You can set this data to a signal if you want to display it in the template

    } catch (error) {
      console.error('Error fetching backers data:', error);
    }
  }
  getStatusConfig(status: number) {
  switch (status) {
    case 0:
      return {
        label: 'Processing',
        classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
      };
    case 1:
      return {
        label: 'Approved',
        classes: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      };
    case 2:
      return {
        label: 'Rejected',
        classes: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      };
    default:
      return { label: '', classes: '' };
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

  formatCurrency(amount: number, symbol: string = 'ETH'): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount) + ` ${symbol}`;
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

  goBack() {
    this.router.navigate(['/explorer']);
  }
  async checkAndUpdate(campaignCurrentStatus : number){
    //  const getCampaignData = await this.contractService.getCampaignData(this.campaignAddress as string);
    //     console.log(getCampaignData,"form investorsssss...");
        // const campaignCurrentStatus = Number(getCampaignData.status)
        if(campaignCurrentStatus != this.campaign()?.status){
            console.log("change status");
            this.apiService.updateCampaign(campaignCurrentStatus, this.campaignAddress as string).subscribe({
              next : (res)=>{
                console.log(res,"update res...");
                
              }
            });
        }else {
          console.log("no update status");
          
        }
  } 
  async doFunding(amt: string) {
    const value = Number(amt);
    console.log(value,"amountamountamount");
    const campaign = this.campaign();
    if (!campaign) return ;
    const remainingAmount = campaign.goal - campaign.raised;
    if( value < campaign.minAmount || value > remainingAmount){
      this.toast.error('Error',`Allowable amount is between ${this.formatCurrency(campaign.minAmount)} and ${this.formatCurrency(remainingAmount)}`);
      return;
    }
    const payFund = await this.contractService.invest(this.campaignAddress as string,amt)
    console.log(payFund,"trx data");
    this.toast.success('Success',`Investment successful! Transaction Hash: ${payFund?.txHash}`);
    
    this.getCampaignData();
    this.apiService.investInCampaign(this.campaign()?.id as string, this.walletState.address as string, value).subscribe({
      next : async(res)=>{
        console.log(res,"investment response from api");
        // this.checkAndUpdate();      
      },
      error : (err)=>{
        console.log();
      }
    })
  }
  refund(){
      console.log("ahh refunduuuu");
      this.contractService.refund(this.campaignAddress as string).then((res)=>{
        console.log(res,"refundd")
        // this.checkAndUpdate();
        this.getCampaignData();
        this.toast.success('Success',`Vote raised successfully! Transaction Hash: ${res?.txHash}`);
      })
  }
  raiseVote(){
      console.log("rasivote,,,,,");
      this.contractService.raiseToVote(this.campaignAddress as string).then((res)=>{
        console.log(res,"vote response");
        // this.checkAndUpdate();
        this.getCampaignData();
        this.toast.success('Success',`Vote raised successfully! Transaction Hash: ${res?.txHash}`);
      }).catch((err)=>{
        console.log(err,"vote error");
        this.toast.error('Error',`Failed to raise vote: ${err.message || err}`);
      })
  }
  vote(status : boolean){
    console.log("voting,,,,,",status);
    this.contractService.vote(this.campaignAddress as string, this.votingResults().length -1, status).then((res)=>{
      console.log(res,"vote response");
      // this.checkAndUpdate();
      this.getCampaignData();
      this.toast.success('Success',`Voted successfully! Transaction Hash: ${res?.txHash}`);
    }).catch((err)=>{
      console.log(err,"vote error");
      this.toast.error('Error',`Failed to vote: ${err.message || err}`);
    })
  }
  withdrawFunds(){
    this.contractService.withdraw(this.campaignAddress as string).then((res)=>{
      console.log(res,"withdraw resp");
      // this.checkAndUpdate();
      this.getCampaignData();
      this.toast.success('Withdraw is successful! Transaction Hash: ${res?.txHash}', 'Success');
    }).catch((err)=>{
      console.log(err,"vote error");
      this.toast.error('Error',`Failed to vote: ${err.message || err}`);
    })
  }
  ngDestroy() {
  }
}