import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  creator: string;
}

@Component({
  selector: 'app-explore-campaign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-campaign.component.html',
  styleUrls: ['./explore-campaign.component.css']
})
export class ExploreCampaignComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  readonly currentTheme = this.themeService.theme;

  // Sample campaigns data
  readonly campaigns = signal<Campaign[]>([
    {
      id: 1,
      title: 'Sustainable Energy Revolution',
      description: 'Revolutionary solar panel technology that reduces installation costs by 60% and increases efficiency by 40%.',
      image: '',
      category: 'Technology',
      raised: 125000,
      goal: 200000,
      backers: 342,
      daysLeft: 15,
      creator: '0x742d35Cc6...4F2a'
    },
    {
      id: 2,
      title: 'Community Garden Network',
      description: 'Building urban community gardens to provide fresh, local produce and foster neighborhood connections.',
      image: '',
      category: 'Community',
      raised: 45000,
      goal: 75000,
      backers: 156,
      daysLeft: 22,
      creator: '0x8f2E4c9B1...7A3d'
    },
    {
      id: 3,
      title: 'AI-Powered Education Platform',
      description: 'Personalized learning platform using AI to adapt to each student\'s learning style and pace.',
      image: '',
      category: 'Education',
      raised: 89000,
      goal: 150000,
      backers: 278,
      daysLeft: 30,
      creator: '0x5B8cF2A9E...1D4f'
    },
    {
      id: 4,
      title: 'Ocean Plastic Cleanup Device',
      description: 'Automated floating device that collects ocean plastic using currents and solar power.',
      image: '',
      category: 'Environment',
      raised: 180000,
      goal: 250000,
      backers: 567,
      daysLeft: 8,
      creator: '0x3E7f9C2B8...5A6b'
    },
    {
      id: 5,
      title: 'Mental Health Support App',
      description: 'Comprehensive mental health app with AI chat support, mood tracking, and professional resources.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      category: 'Health',
      raised: 67000,
      goal: 100000,
      backers: 423,
      daysLeft: 18,
      creator: '0x9D4E8F1C7...2B5a'
    },
    {
      id: 6,
      title: 'Local Artisan Marketplace',
      description: 'Online platform connecting local artisans with customers, featuring unique handmade products.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
      category: 'Business',
      raised: 32000,
      goal: 50000,
      backers: 89,
      daysLeft: 25,
      creator: '0x1A7B3F9E5...8C2d'
    }
  ]);

  // Categories for filtering
  readonly categories = signal<string[]>([
    'All',
    'Technology',
    'Community',
    'Education',
    'Environment',
    'Health',
    'Business'
  ]);

  readonly selectedCategory = signal<string>('All');

  // Computed signal for filtered campaigns
  readonly filteredCampaigns = computed(() => {
    const category = this.selectedCategory();
    if (category === 'All') {
      return this.campaigns();
    }
    return this.campaigns().filter(campaign => campaign.category === category);
  });

  // Methods
  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  viewCampaign(campaignId: number) {
    this.router.navigate(['/campaign', campaignId]);
  }

  getProgressPercentage(campaign: Campaign): number {
    return Math.min((campaign.raised / campaign.goal) * 100, 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}