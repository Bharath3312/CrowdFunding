export interface WalletProvider {
    id: string;
    name: string;
    icon: string;
    provider: any;
    enabled: boolean;
  }
  
export interface WalletState {
    isConnected: boolean;
    address: string | null;
    provider : any;
    chainId: number | null;
    error: string | null;
    isLoading: boolean;
}