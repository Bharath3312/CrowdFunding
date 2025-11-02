import { Routes } from '@angular/router';

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
    path: 'campaign/:id',
    loadComponent: () => import('./pages/campaign/campaign.component').then(m => m.CampaignComponent)
  },
  // {
  //   path: 'explorer',
  //   loadComponent: () => import('./pages/explorer/explorer.component').then(m => m.ExplorerComponent)
  // },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'create-campaign',
    loadComponent: () => import('./pages/create-campaign/create-campaign.component').then(m => m.CreateCampaignComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'explorer',
    loadComponent: () => import('./pages/explore-campaign/explore-campaign.component').then(m => m.ExploreCampaignComponent)
  }
];
