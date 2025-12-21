import { environment } from "../../environments/environment";
import { WalletProvider } from "../models/wallet-provider.model";
const providers: WalletProvider [] = [];


export function initWalletDiscovery(callback: (provider: WalletProvider) => void) {
  // Listen for EIP-6963 wallet announcements
  window.addEventListener("eip6963:announceProvider", (event: any) => {
    
    const detail = event.detail.info;
    const provider = event.detail.provider;
    const wallet: WalletProvider = {
      id: detail.uuid,
      name: detail.name,
      icon: detail.icon,
      provider: provider,
      enabled: environment.supportedWallets.includes(detail.name.toLowerCase())
    };

    providers.push(wallet);
    callback(wallet);
  });

  // Trigger discovery request
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

export function getWalletProviders(): WalletProvider[] {
  return providers;
}


