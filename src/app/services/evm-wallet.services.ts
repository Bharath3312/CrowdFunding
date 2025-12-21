import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WalletProvider, WalletState } from '../models/wallet-provider.model';
import { initWalletDiscovery } from './evm-provider-registry';
import { ethers } from 'ethers';

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

  constructor() {
    
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

      this.listenForEvents(wallet.provider);

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
      if(!accounts.length) this.disconnect()
      this.updateState({address : accounts[0]})
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
