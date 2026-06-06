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

interface Campaign {
  id: number;
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
  
  readonly currentTheme = this.themeService.theme;
  isPdfLoading = signal<boolean>(true);
  campaignAddress: string | null = null;

  readonly campaign = signal<Campaign | null>(null);
  readonly backers = signal<{address: string, value : number}[]>([]);
  readonly votingResults = signal<{amount : number; yes: number; no: number; status: number}[]>([]);
  readonly activeTab = signal<'PDF' | 'updates' | 'faqs'>('PDF');

  walletState : WalletState  = this.walletServices.walletState$.getValue();

  wallet$ = toSignal(
    this.walletServices.walletState$Observable,
    {initialValue : this.walletServices.walletState$.getValue()}
  )

  constructor(){
    effect(()=>{
      const state = this.wallet$();
      console.log(state,"wallet state in campaign page");
      this.walletState = state;
    })
  }
  async ngOnInit() {    
    this.fetchCampaignData();    
  }

  async fetchCampaignData() {
    this.campaignAddress = this.route.snapshot.queryParamMap.get('id') ?? null;
    if (this.campaignAddress) {
      console.log('Campaign address from query params:', this.campaignAddress);
      const campaignData = await  this.contractService.getCampaignData(this.campaignAddress);
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
          backers : campaignData.totalInvestors.length ?? 0,
          category : campaignData.category.toUpperCase(),
          daysLeft : this.calculateDaysLeft(Number(campaignData.deadline)),
          fundingType : Number(campaignData.fundingType),
          votingRaised : Number(campaignData.totalRaisingVotes),
          status :Number(campaignData.status)
        }
        if(campaignData.totalInvestors.length > 0){
          this.getBackers(campaignData.totalInvestors);
        }
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
      
      for(let i=votingRaised -1 ;i>= 0;i--){
        const voteData = await this.contractService.getVoteingResults(this.campaignAddress as string, i);
        const results = {
          amount : parseInt(ethers.formatEther(voteData.amount)),
          yes : Number(voteData.yesVotes),
          no :Number(voteData.noVotes),
          status :Number(voteData.status)
        }
        console.log(results,"resultssss",voteData);
        
        this.votingResults.update(votes => [...votes, results]);
      }
        console.log(this.votingResults(),"voteData in loop");
      
    } catch (error) {
      console.error('Error fetching voting results:', error);
    }
  }
  async getBackers(investors: string[]) {
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
    const backers = this.campaign()?.backers || 0;
    this.backers.set([]);
    await this.fetchCampaignData(); // Refresh campaign data
    // if((this.campaign()?.backers ?? 0) > backers){
    //   await this.firebase.updateContribution(`${this.walletState.address}_${this.walletState.chainId}`, this.campaignAddress as string ,value);
    //   await this.firebase.incrementUserCampaignStat(
    //     `${this.campaign()?.owner}_${this.walletState.chainId}`, 'totalBackers', 1);
    // }
    //   await this.firebase.incrementUserCampaignStat(
    //   `${this.campaign()?.owner}_${this.walletState.chainId}`, 'totalRaised', value);
    
    // if((this.campaign()?.backers ?? 0)> backers && this.campaign()?.owner){
    //   const firebaseData = await this.firebase.getUserData(`${this.campaign()?.owner}_${this.walletState.chainId}`);
    //   if(firebaseData){
    //     this.firebase.incrementUserStat(
    //       `${this.campaign()?.owner}_${this.walletState.chainId}`, 'totalBackers', 1);
    //       this.firebase.incrementUserStat(
    //         `${this.campaign()?.owner}_${this.walletState.chainId}`, 'totalRaised', value);
    //       // this.firebase.updateUserData(
    //       //   `${this.campaign()?.owner}_${this.walletState.chainId}`, {
    //       //     backers : firebaseData?.['backers'] ? [...(firebaseData['backers']), this.walletState.address] : [this.walletState.address]
    //       //   }
    //       // )
    //   }

    // }
  }
  refund(){
      console.log("ahh refunduuuu");
      this.contractService.refund(this.campaignAddress as string).then((res)=>{
        console.log(res,"refundd")
         this.toast.success('Success',`Vote raised successfully! Transaction Hash: ${res?.txHash}`);
        this.fetchCampaignData();
      })
  }
  raiseVote(){
      console.log("rasivote,,,,,");
      this.contractService.raiseToVote(this.campaignAddress as string).then((res)=>{
        console.log(res,"vote response");
        this.toast.success('Success',`Vote raised successfully! Transaction Hash: ${res?.txHash}`);
        this.fetchCampaignData();
      }).catch((err)=>{
        console.log(err,"vote error");
        this.toast.error('Error',`Failed to raise vote: ${err.message || err}`);
      })
  }
  vote(status : boolean){
    console.log("voting,,,,,",status);
    this.contractService.vote(this.campaignAddress as string, this.votingResults().length -1, status).then((res)=>{
      console.log(res,"vote response");
      this.toast.success('Success',`Voted successfully! Transaction Hash: ${res?.txHash}`);
      this.votingResults.set([])
        this.fetchCampaignData();
    }).catch((err)=>{
      console.log(err,"vote error");
      this.toast.error('Error',`Failed to vote: ${err.message || err}`);
    })
  }
  withdrawFunds(){
    this.contractService.withdraw(this.campaignAddress as string).then((res)=>{
      console.log(res,"withdraw resp");
      this.toast.success('Withdraw is successful! Transaction Hash: ${res?.txHash}', 'Success');
      this.backers.set([]);
      this.votingResults.set([]);
      this.fetchCampaignData(); /// when withdraw is not update properly  is on going||  then refund  and voteing flow is completed 
    }).catch((err)=>{
      console.log(err,"vote error");
      this.toast.error('Error',`Failed to vote: ${err.message || err}`);
    })
  }
  ngDestroy() {
  }
}