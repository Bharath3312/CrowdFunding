import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { connectWalletGuard } from './connect-wallet.guard';

describe('connectWalletGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => connectWalletGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
