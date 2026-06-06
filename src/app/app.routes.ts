import { Routes } from '@angular/router';
import { connectWalletGuard } from './guard/connect-wallet.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  // {
  //   path: 'explorer',
  //   loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent)
  // },
  {
    path: 'campaign',
    canActivate: [connectWalletGuard],
    loadComponent: () => import('./pages/campaign/campaign.component').then(m => m.CampaignComponent)
  },
  // {
  //   path: 'explorer',
  //   loadComponent: () => import('./pages/explorer/explorer.component').then(m => m.ExplorerComponent)
  // },
  // {
  //   path: 'dashboard',
  //   canActivate: [connectWalletGuard],
  //   loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  // },
  {
    path: 'create-campaign',
    canActivate: [connectWalletGuard],
    loadComponent: () => import('./pages/create-campaign/create-campaign.component').then(m => m.CreateCampaignComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'explorer',
    canActivate: [connectWalletGuard],
    loadComponent: () => import('./pages/explore-campaign/explore-campaign.component').then(m => m.ExploreCampaignComponent)
  },

  {
    path :'connect-wallet',
    loadComponent: () => import('./pages/connect-wallet/connect-wallet.component').then(m => m.ConnectWalletComponent)
  },

  // {
  // path: 'dashboard',
  // canActivate: [connectWalletGuard],
  // loadComponent: () =>
  //   import('./pages/dashboard-layout/dashboard-layout.component').then(
  //     m => m.DashboardLayoutComponent
  //   ),
  // children: [
  //    {
  //     path: '',
  //     pathMatch: 'full',
  //     loadComponent: () =>
  //       import('./pages/dashboard/dashboard.component').then(
  //       m => m.DashboardComponent
  //     ),
  //   },
  //   {
  //     path: 'my-campaigns',
  //     loadComponent: () =>
  //       import('./pages/my-campaigns/my-campaigns.component').then(
  //         m => m.MyCampaignsComponent
  //       )
  //   },
  //   {
  //     path: 'my-contributions',
  //     loadComponent: () =>
  //       import('./pages/my-contributions/my-contributions.component').then(
  //         m => m.MyContributionsComponent
  //       )
  //   }
  // ]
  // },
  {
      path: 'my-campaigns',
      loadComponent: () =>
        import('./pages/my-campaigns/my-campaigns.component').then(
          m => m.MyCampaignsComponent
        )
  },
  {
      path: 'my-contributions',
      loadComponent: () =>
        import('./pages/my-contributions/my-contributions.component').then(
          m => m.MyContributionsComponent
        )
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent)
  }
];
