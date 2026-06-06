import { Injectable } from '@angular/core';
import { Firestore,doc,setDoc,updateDoc,increment, getDoc } from '@angular/fire/firestore';

interface UserCampaignData {
  uid : string;
  activeCampaigns: number;
  successfulCampaigns: number;
  failedCampaigns: number;
  totalRaised: number;
  totalBackers: number;
  campaigns: [
    {
      campaignId: string;
      createdAt: Date;
    }
  ];
}

interface UserContributionData {
  uid : string;
  totalDonated: number;
  ActiveContributions: number;
  successfulContributions: number;
  failedContributions: number;
  contributions: [
    {
      campaignId: string;
      amount: number;
      contributedAt: Date;
    }
  ];
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore : Firestore) { }

  async addUserCampaign(uid: string, campaignId: string) {
    const userCampaignRef = doc(this.firestore, `user_campaigns/${uid.toLowerCase()}`);
    const snap = await getDoc(userCampaignRef);
    if(!snap.exists()) {
      return setDoc(userCampaignRef, {
        uid,
        activeCampaigns: 1,
        successfulCampaigns: 0,
        failedCampaigns: 0,
        totalRaised: 0,
        totalBackers: 0,
        campaigns: [{ campaignId, createdAt: new Date() }]
      });
    }else{
      const data = snap.data() as UserCampaignData;
      const isActive = data.campaigns.some(c => c.campaignId === campaignId);
      if(!isActive) {
        return updateDoc(userCampaignRef, {
          activeCampaigns: increment(1),
          campaigns: [...data.campaigns, { campaignId, createdAt: new Date() }]
        });
      }
      return false;
    }
  }

  async incrementUserCampaignStat<k extends keyof UserCampaignData>(uid: string, field: k, value: number) {
    const userCampaignRef = doc(this.firestore, `user_campaigns/${uid.toLowerCase()}`);
    return updateDoc(userCampaignRef, {
      [`${field}`]: increment(value)
    });
  }

  async getUserCampaignData(uid: string) {
    const snap = await getDoc(
      doc(this.firestore, `user_campaigns/${uid.toLowerCase()}`)
    );
    return snap.exists() ? snap.data() : null;
  }

  /////////////////////

  async updateContribution(uid: string, campaignId: string, amount: number) {
    const userContributionRef = doc(this.firestore, `user_contributions/${uid.toLowerCase()}`);
    const snap = await getDoc(userContributionRef);
    if(!snap.exists()) {
      return setDoc(userContributionRef, {
        uid,
        totalDonated: amount,
        ActiveContributions: 1,
        successfulContributions: 0,
        failedContributions: 0,
        contributions: [{ campaignId, amount, contributedAt: new Date() }]
      });
    }else{
      const data = snap.data() as UserContributionData;
      const hasContributed = data.contributions.some(c => c.campaignId === campaignId);
      if(hasContributed) {
        return updateDoc(userContributionRef, {
          totalDonated: increment(amount),
        });

      }else{
        return updateDoc(userContributionRef, {
          totalDonated: increment(amount),
          ActiveContributions: increment(1),
          contributions: [...data.contributions, { campaignId, amount, contributedAt: new Date() }]
        });
    }
    }
    
  }

  async updateContributionStat<k extends keyof UserContributionData>(uid: string, field: k, value: number) {
    const userContributionRef = doc(this.firestore, `user_contributions/${uid.toLowerCase()}`);
    return updateDoc(userContributionRef, {
      [`${field}`]: increment(value) 
    });
  }

  async getUserContributionData(uid: string) {
    const snap = await getDoc(
      doc(this.firestore, `user_contributions/${uid.toLowerCase()}`)
    );
    return snap.exists() ? snap.data() : null;
  }

}
