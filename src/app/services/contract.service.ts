import { Injectable } from '@angular/core';
import { EvmWalletServices } from './evm-wallet.services';
import { WalletState } from '../models/wallet-provider.model';
import { ethers } from 'ethers';
@Injectable({
  providedIn: 'root'
})
export class ContractService {
  currentWalletState: WalletState | null = null;
  private factoryAddress = "YOUR_FACTORY_ADDRESS";
  private factoryAbi = [ /* YOUR_FACTORY_ABI */ ];
  private campaignAbi = [ /* YOUR_CAMPAIGN_ABI */ ];
  constructor(private walletServices : EvmWalletServices) {
    this.walletServices.walletState$.subscribe((state : WalletState) =>{
        this.currentWalletState = state;
        console.log(this.currentWalletState,"currentwalletstate");
      })
   }

  private getProvider() {
    return this.currentWalletState?.provider;
  }

  private async getSigner() {
    const provider = await this.getProvider();
    return provider.getSigner();
  }

  private async getFactoryContract() {
    const signer = await this.getSigner();
    return new ethers.Contract(
      this.factoryAddress,
      this.factoryAbi,
      signer
    );
  }

   // ==========================================
  //            FACTORY FUNCTIONS
  // ==========================================


  async createCampaign(data: any) {
    const contract = await this.getFactoryContract();
    const tx = await contract['createCampaign'](
      data.title,
      data.description,
      data.imgUrl,
      data.pdfUrl,
      data.minAmount,
      data.maxAmount,
      data.fundingType,
      data.category,
      data.deadline
    );
    return await tx.wait();
  }

  async getAllCampaigns() {
    const contract = await this.getFactoryContract();
    return await contract['getAllCampaigns']();
  }

    // ==========================================
  //          SINGLE CAMPAIGN FUNCTIONS
  // ==========================================

   async getCampaignContract(address: string) {
    const signer = await this.getSigner();
    return new ethers.Contract(address, this.campaignAbi, signer);
  }

  async invest(campaignAddress: string, amount: string) {
    const contract = await this.getCampaignContract(campaignAddress);
    const value = ethers.parseEther(amount.toString());

    const tx = await contract['invest']({ value });
    return await tx.wait();
  }

  async raiseToVote(campaignAddress: string) {
    const contract = await this.getCampaignContract(campaignAddress);
    const tx = await contract['raiseTovote']();
    return await tx.wait();
  }

  async vote(campaignAddress: string, requestId: number, support: boolean) {
    const contract = await this.getCampaignContract(campaignAddress);
    const tx = await contract['vote'](requestId, support);
       return await tx.wait();
  }

   async withdraw(campaignAddress: string) {
    const contract = await this.getCampaignContract(campaignAddress);
    const tx = await contract['withdraw']();
    return await tx.wait();
  }

  async refund(campaignAddress: string) {
    const contract = await this.getCampaignContract(campaignAddress);
    const tx = await contract['refund']();
    return await tx.wait();
  }

}
