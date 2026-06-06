import { Component, OnDestroy, OnInit } from '@angular/core';
import { WalletProvider } from '../../models/wallet-provider.model';
import { EvmWalletServices } from '../../services/evm-wallet.services';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-connect-wallet',
  imports: [CommonModule],
  templateUrl: './connect-wallet.component.html',
  styleUrl: './connect-wallet.component.css'
})
export class ConnectWalletComponent implements OnInit, OnDestroy {
  installedSupportedWallets: boolean;
  redirectUrl: string = '/';
  readonly walletOptions: WalletProvider[];
  private walletSub!: Subscription;   // 👈 store subscription

  constructor(
    public walletServices: EvmWalletServices,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirectTo') || '/';

    // 👇 subscribe and store reference
    this.walletSub = this.walletServices.walletState$.subscribe(state => {
      console.log(state, "state from connect wallet");
      if (state.isConnected) {
        this.router.navigateByUrl(this.redirectUrl);
      }
    });

    this.walletOptions = this.walletServices.availableWallets.filter(wallet => wallet.enabled);
    this.installedSupportedWallets = !!this.walletOptions.find(wallet => wallet.enabled);
    console.log(this.installedSupportedWallets, "installsupportedwallets");
  }

  ngOnInit() {
    console.log(this.walletOptions, "wallet options");
  }

  async selectWallet(wallet: WalletProvider) {
    console.log(`Connecting to ${wallet.name}`);
    let status = await this.walletServices.connect(wallet);
    console.log(status, "connection status connect wallet");
    if (status) {
      this.router.navigateByUrl(this.redirectUrl);
    }
  }

  ngOnDestroy() {
    console.log("connect wallet component destroyed");
    if (this.walletSub) {
      this.walletSub.unsubscribe();   // 👈 clean up
    }
  }
}
