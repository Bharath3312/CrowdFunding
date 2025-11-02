import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface Campaign {
  id: string;
  title: string;
  category: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'draft';
  progress: number;
  image: string;
}

interface Activity {
  id: string;
  type: 'contribution' | 'milestone' | 'update' | 'backer';
  title: string;
  description: string;
  timestamp: Date;
  amount?: number;
  user?: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private themeService = inject(ThemeService);

  // Reactive theme state
  readonly isDarkMode = this.themeService.isDarkMode;

  // Dashboard data signals
  readonly stats = signal<StatCard[]>([
    {
      title: 'Total Raised',
      value: '$45,230',
      change: 12.5,
      changeType: 'positive',
      icon: '💰'
    },
    {
      title: 'Active Campaigns',
      value: 8,
      change: 2,
      changeType: 'positive',
      icon: '🚀'
    },
    {
      title: 'Total Backers',
      value: 1247,
      change: -3.2,
      changeType: 'negative',
      icon: '👥'
    },
    {
      title: 'Success Rate',
      value: '87%',
      change: 5.1,
      changeType: 'positive',
      icon: '📈'
    }
  ]);

  readonly campaigns = signal<Campaign[]>([
    {
      id: '1',
      title: 'Sustainable Energy Revolution',
      category: 'Technology',
      goal: 50000,
      raised: 38750,
      backers: 234,
      daysLeft: 15,
      status: 'active',
      progress: 77.5,
      image: '/assets/campaign-1.jpg'
    },
    {
      id: '2',
      title: 'Community Garden Network',
      category: 'Environment',
      goal: 25000,
      raised: 18200,
      backers: 156,
      daysLeft: 8,
      status: 'active',
      progress: 72.8,
      image: '/assets/campaign-2.jpg'
    },
    {
      id: '3',
      title: 'Educational VR Platform',
      category: 'Education',
      goal: 75000,
      raised: 52000,
      backers: 389,
      daysLeft: 22,
      status: 'active',
      progress: 69.3,
      image: '/assets/campaign-3.jpg'
    },
    {
      id: '4',
      title: 'Local Art Collective',
      category: 'Arts',
      goal: 15000,
      raised: 15000,
      backers: 98,
      daysLeft: 0,
      status: 'completed',
      progress: 100,
      image: '/assets/campaign-4.jpg'
    }
  ]);

  readonly recentActivity = signal<Activity[]>([
    {
      id: '1',
      type: 'contribution',
      title: 'New Contribution',
      description: 'John Doe contributed $250 to Sustainable Energy Revolution',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      amount: 250,
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'milestone',
      title: 'Milestone Reached',
      description: 'Community Garden Network reached 75% of its goal',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: '3',
      type: 'backer',
      title: 'New Backer',
      description: 'Sarah Wilson joined as a backer for Educational VR Platform',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      user: 'Sarah Wilson'
    },
    {
      id: '4',
      type: 'update',
      title: 'Campaign Update',
      description: 'Local Art Collective posted a new update',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    }
  ]);

  // Computed signals
  readonly totalRaised = computed(() =>
    this.campaigns().reduce((sum, campaign) => sum + campaign.raised, 0)
  );

  readonly activeCampaigns = computed(() =>
    this.campaigns().filter(campaign => campaign.status === 'active')
  );

  readonly completedCampaigns = computed(() =>
    this.campaigns().filter(campaign => campaign.status === 'completed')
  );

  // Helper methods
  getStatusColor(status: Campaign['status']): string {
    switch (status) {
      case 'active': return 'var(--accent-green)';
      case 'completed': return 'var(--accent-blue)';
      case 'draft': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  }

  getActivityIcon(type: Activity['type']): string {
    switch (type) {
      case 'contribution': return '💰';
      case 'milestone': return '🎯';
      case 'update': return '📝';
      case 'backer': return '👤';
      default: return '📌';
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}