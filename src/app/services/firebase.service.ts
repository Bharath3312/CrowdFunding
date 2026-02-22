import { Injectable } from '@angular/core';
import { Firestore,doc,setDoc,updateDoc,increment,docData, getDoc } from '@angular/fire/firestore';

interface UserData {
  uid : string;
  walletAddress: string;
  totalRaised: number;
  totalBackers: number;
  totalSuccess: number;
  totalFailed: number;
  activeCampaigns: number;
  totalCampaign: number;
  campaigns: string[];
  chainId : number;
}

interface CampaignData {
  title: string;
  description: string;
  image: string;
  raisedAmount: number;
  backers :{
    address: string;
    amount: number;
  }[];
  votingResults: {
    id : number;
    action : boolean;
    votes: boolean;
  }
  campaignAddress: string;
}  

interface recentActivity {
  type: 'created' | 'backed' | 'voted' | 'withdrawn';
  campaignTitle: string;
  amount?: number;
  vote?: boolean;
  timestamp: number;
}
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore : Firestore) { }

  updateUserData(uid : string , user: Partial<UserData>) {
    return setDoc(
      doc(this.firestore, `users/${uid.toLowerCase()}`),
      user,
      { merge: true }
    );
  }
  createUserData(user: UserData) {
    return setDoc(
      doc(this.firestore, `users/${user.uid.toLowerCase()}`),
      user,
      { merge: true }
    );
  }
  async getUserData(uid: string) {
    console.log(uid,"fb method is call ++++++++++++++++++++++++");
    
    const snap = await getDoc(
      doc(this.firestore, `users/${uid.toLowerCase()}`)
    );
    return snap.exists() ? snap.data() : null;
  }

  incrementUserStat(uid: string, field: string, value: number) {
    return updateDoc(
      doc(this.firestore, `users/${uid.toLowerCase()}`),
      {
        [`${field}`]: increment(value)
      }
    );
  }
}
