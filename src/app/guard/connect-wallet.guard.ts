import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EvmWalletServices } from '../services/evm-wallet.services';

export const connectWalletGuard: CanActivateFn = (route, state) => {
  console.log(state.url,"state.url");
  
  const walletService = inject(EvmWalletServices);
  const router = inject(Router);

  // If connected → allow
  if (walletService.walletState$.getValue().isConnected) {
    return true;
  }

  // If not connected → redirect to connect-wallet, but remember target
  return router.createUrlTree(['/connect-wallet'], {
    queryParams: { redirectTo: state.url }
  });
};
