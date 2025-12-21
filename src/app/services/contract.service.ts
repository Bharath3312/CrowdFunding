import { Injectable } from '@angular/core';
import { EvmWalletServices } from './evm-wallet.services';
import { WalletState } from '../models/wallet-provider.model';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ContractService {
  currentWalletState: WalletState | null = null;
  private campaignFactoryAddress = environment.campaignFactoryAddress ;
	private campaignFactoryAbi = [ 
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "campaignAddress",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "CampaignCreated",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_description",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_imgUrl",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_pdfUrl",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "_minAmount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_maxAmount",
					"type": "uint256"
				},
				{
					"internalType": "uint8",
					"name": "_fundingType",
					"type": "uint8"
				},
				{
					"internalType": "string",
					"name": "_category",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "_deadline",
					"type": "uint256"
				}
			],
			"name": "createCampaign",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "campaigns",
			"outputs": [
				{
					"internalType": "contract Campaign",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getAllCampaigns",
			"outputs": [
				{
					"internalType": "contract Campaign[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "graceDays",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	];
	private campaignAbi = [
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_description",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_imgUrl",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "_pdfUrl",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "_minAmount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_maxAmount",
					"type": "uint256"
				},
				{
					"internalType": "uint8",
					"name": "_fundingType",
					"type": "uint8"
				},
				{
					"internalType": "string",
					"name": "_category",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "_deadline",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_graceDays",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "_owner",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "investor",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Invested",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "investor",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Refunded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "enum Campaign.Status",
					"name": "newStatus",
					"type": "uint8"
				}
			],
			"name": "StatusChanged",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "address",
					"name": "owner",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Withdrawn",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "getCampaginData",
			"outputs": [
				{
					"components": [
						{
							"internalType": "string",
							"name": "title",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "description",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "imageUrl",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "pdfUrl",
							"type": "string"
						},
						{
							"internalType": "uint256",
							"name": "minAmount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "maxAmount",
							"type": "uint256"
						},
						{
							"internalType": "enum Campaign.FundingType",
							"name": "fundingType",
							"type": "uint8"
						},
						{
							"internalType": "string",
							"name": "category",
							"type": "string"
						},
						{
							"internalType": "uint256",
							"name": "deadline",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "graceDays",
							"type": "uint256"
						},
						{
							"internalType": "address",
							"name": "owner",
							"type": "address"
						},
						{
							"internalType": "uint256",
							"name": "totalInvested",
							"type": "uint256"
						},
						{
							"internalType": "enum Campaign.Status",
							"name": "status",
							"type": "uint8"
						},
						{
							"internalType": "uint8",
							"name": "totalRaisingVotes",
							"type": "uint8"
						},
						{
							"internalType": "uint8",
							"name": "totalInvestors",
							"type": "uint8"
						}
					],
					"internalType": "struct Campaign.CampaignData",
					"name": "",
					"type": "tuple"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "invest",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "investors",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "raiseTovote",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "refund",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_requestId",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "_support",
					"type": "bool"
				}
			],
			"name": "vote",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "voteRequests",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"internalType": "uint8",
					"name": "yesVotes",
					"type": "uint8"
				},
				{
					"internalType": "uint8",
					"name": "noVotes",
					"type": "uint8"
				},
				{
					"internalType": "enum Campaign.VStatus",
					"name": "status",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "withdraw",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}

	];
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
      const browserProvider = new ethers.BrowserProvider(provider);
      return browserProvider.getSigner();
    }

  private async getFactoryContract() {
    const signer = await this.getSigner();
    return new ethers.Contract(
      this.campaignFactoryAddress,
      this.campaignFactoryAbi,
      signer
    );
  }

//   async temp(){
//     try {
//       const contract = await this.getFactoryContract();
//       const test = await contract['getAllCampaigns']();
//       console.log(test,"factory contract");
//       return true
//     } catch (error) {
//       console.log(error,"contract service error in temp func");
//         return false;
//     }
//   }

   // ==========================================
  //            FACTORY FUNCTIONS
  // ==========================================


  async createCampaign(data: any) {
    try {
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
    } catch (error) {
      console.log(error , "contractServicessss");
    }
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

  async getCampaignData(campaignAddress: string) {
		try {
				const contract = await this.getCampaignContract(campaignAddress);
				return await contract['getCampaginData']();
		} catch (error) {
			console.log(error,"error fsdfsdfdf");
			
			return null;
		}
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
