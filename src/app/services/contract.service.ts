import { Injectable } from '@angular/core';
import { EvmWalletServices } from './evm-wallet.services';
import { WalletState } from '../models/wallet-provider.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private factoryAddress = "YOUR_FACTORY_ADDRESS";
  private factoryAbi = [ /* YOUR_FACTORY_ABI */ ];
  constructor(private walletServices : EvmWalletServices) {
    this.walletServices.walletState$.subscribe((state : WalletState) =>{
        if(state.isConnected){  
          console.log("Wallet connected in Contract Service 111:",state.address);
        } })
    this.walletServices.walletState$Observable.subscribe((state : WalletState) =>{
        if(state.isConnected){  
          console.log("Wallet connected in Contract Service:",state.address);
        }
    });
    
   }
}
