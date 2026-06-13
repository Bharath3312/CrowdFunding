import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { WalletProvider, WalletState } from '../models/wallet-provider.model';
import { initWalletDiscovery } from './evm-provider-registry';
import { ethers } from 'ethers';
import { ApiServiceService } from './api-service.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class EvmWalletServices {
  defaultState = {
    isConnected: false,
    address: null,
    provider : null,
    chainId: null,
    error: null,
    isLoading: false,
  }

  public walletState$ =   new BehaviorSubject<WalletState>(this.defaultState);
  private wallets: WalletProvider[] = [];

  constructor(private apiService : ApiServiceService,private toast : ToastService) {
    
    initWalletDiscovery((wallet) => {
      console.log(wallet.name,"wallets init");
      this.wallets.push(wallet);
     const preferredWallet = localStorage.getItem('preferredWallet');
      if(preferredWallet == wallet.name){
          this.connect(wallet)
      }
    });

  }

  private updateState(newState : Partial<WalletState>){
    this.walletState$.next({...this.walletState$.getValue(),...newState});
  }

  get availableWallets() {
    return this.wallets;
  }

  get walletState$Observable(){
    return this.walletState$.asObservable();
  }
  async verifiySignature(message: string, signature: string){
    try {
        // const message ="Login to Crowdfunding App: 1774923720982";
        // const singmessage = "0xf5cb76fc69b809ab440e472abca24808986e11a47950e3e15c0815b3fcd357e61721fd7a1293d62388ba4102150ae96871215d80cdd877caa6227ebe19355e361c";
        const signerAddress = await ethers.verifyMessage(message, signature);
        console.log("Signer Address to verify:", signerAddress);
    } catch (err) {
      console.error("Signature verification failed", err);
    }

  }
  async signMessage(nonce : string): Promise<string | void> { 
    try {
      // const nonce = "Sign this message to login: b71f151d-5e24-45d5-a1ba-77e454460107";
      
      console.log(nonce,"message");
      
      const signature =  await this.walletState$.getValue().provider.request({
        method :'personal_sign',
        params : [nonce, this.walletState$.getValue().address]
      });
      console.log("Message signed:", signature);
      // this.verifiySignature(nonce,signature);
      return signature;

    } catch (err) {
      console.error("Message signing failed", err);
    }
  }

 async authenticate(walletAddress: string): Promise<void> {
  try {
    // Step 1: Get nonce
    const nonceRes = await firstValueFrom(this.apiService.getNonce(walletAddress));

    if (!nonceRes.success || !nonceRes.data) {
      this.toast.error("Authentication failed", nonceRes.msg || "Could not get nonce");
      return;
    }

    // Step 2: Sign message
    const signedMessage = await this.signMessage(nonceRes.data);

    if (!signedMessage) {
      this.toast.error("Authentication failed", "Message signing failed");
      return;
    }

    // Step 3: Verify signature
    const verifyRes = await firstValueFrom(
      this.apiService.verifySignature(walletAddress, signedMessage, nonceRes.data)
    );

    if (!verifyRes.success) {
      this.toast.error("Authentication failed", "Signature verification failed");
      return;
    }

    // Step 4: Store token
    if (verifyRes.data?.token) {
      this.apiService.setToken(verifyRes.data.token, walletAddress);
      console.log("Authentication successful");
    }

  } catch (err) {
    console.error("Authentication failed", err);
    this.toast.error("Authentication failed", "Could not get nonce");
  }
}



  async connect(wallet: WalletProvider): Promise<boolean> {
    try {
      localStorage.setItem('preferredWallet', wallet.name);
      this.updateState({isLoading:true})
      const provider = new ethers.BrowserProvider(wallet.provider);

      const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
     const[account,chainId] = await Promise.all([
        wallet.provider.request({method : 'eth_requestAccounts'}),
        wallet.provider.request({ method: 'eth_chainId' })
      ])
      if(!accounts.length) throw new Error('Empty accounts');
      this.updateState({isConnected  : true, address : account[0],chainId : parseInt(chainId,16),isLoading : false,provider : wallet.provider})
      console.log(accounts,"accounts");
      console.log(chainId,"chainds");
      // localStorage.setItem('account', account[0]);
      
      this.listenForEvents(wallet.provider);
      const storedAccount = localStorage.getItem('verifyAccount');
      const token = localStorage.getItem('authToken');
      const expiry = localStorage.getItem('tokenExpiry');

      if (
        account[0]?.toUpperCase() !== storedAccount?.toUpperCase() ||
        !token ||
        !expiry ||
        Date.now() > Number(expiry)
      ) {
          this.authenticate(account[0]);
      }
      return true;
    } catch (err) {
      this.updateState({isLoading:false})
      console.error("Wallet connection failed", err);
      return false;
    }
  }
  private listenForEvents(provider: any) {
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts,"list");
      if(!accounts.length) this.disconnect();
      this.updateState({address : accounts[0]})
      this.authenticate(accounts[0]);
    });

    provider.on("chainChanged", (chainId: string) => {
      console.log(chainId,"chainds");
      this.updateState({chainId : parseInt(chainId,16)})
    });

    provider.on("disconnect", () => {
      console.log("disconnect metamask !!!!!!!!!!!");
      this.disconnect();
    });
  }

  async switchCain(chainId: number=31337): Promise<boolean> {
    try {
      await (this.walletState$.getValue().provider as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }],
      });
      return true;
    } catch (err) {
      console.error("Switch chain failed*****************", err);
      return false;
    }
  }

  disconnect() {
    this.updateState(this.defaultState)
  }
}
