import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { EvmWalletServices } from '../../services/evm-wallet.services';
import { WalletProvider } from '../../models/wallet-provider.model';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  readonly walletOptions: WalletProvider[];

  constructor(public walletServices: EvmWalletServices) {
    console.log(this.walletServices.availableWallets,"availablewallets",this.walletServices.walletState$Observable);
    this.walletOptions = this.walletServices.availableWallets;

  }

  private themeService = inject(ThemeService);

  isMobileMenuOpen = signal(false);
  isWalletModalOpen = signal(false);

  // Theme signals
  readonly theme = this.themeService.theme;
  readonly isDarkMode = this.themeService.isDarkMode;

  toggleMobileMenu = ()=> this.isMobileMenuOpen.update(open => !open);

  closeMobileMenu = ()=>  this.isMobileMenuOpen.set(false);
  
  toggleTheme = ()=>  this.themeService.toggleTheme();

  connectWallet =() => this.isWalletModalOpen.set(true);

  disconnetWallet = ()=> this.walletServices.disconnect()
  
  closeWalletModal = () => this.isWalletModalOpen.set(false);
  

  async selectWallet(wallet: WalletProvider) {
    console.log(`Connecting to ${wallet.name}`);
    let status = await this.walletServices.connect(wallet)
    console.log(status,"connection status");
    if(status) this.closeWalletModal();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey = () =>{
    if (this.isWalletModalOpen()) {
      this.closeWalletModal();
    }
  }
  

  @HostListener('document:click', ['$event'])
  onDocumentClick= (event: Event)=> {
    const target = event.target as HTMLElement;
    const modal = document.querySelector('.wallet-modal');
    const button = document.querySelector('[data-wallet-button]');

    if (this.isWalletModalOpen() && modal && button &&
        !modal.contains(target) && !button.contains(target)) {
      this.closeWalletModal();
    }
  }
}