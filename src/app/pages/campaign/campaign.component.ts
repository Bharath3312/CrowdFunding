import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface Campaign {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  category: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  creator: {
    name: string;
    avatar: string;
    bio: string;
    location: string;
    projects: number;
  };
  rewards: Reward[];
  updates: Update[];
  faqs: FAQ[];
}

interface Reward {
  id: number;
  title: string;
  description: string;
  amount: number;
  estimatedDelivery: string;
  backers: number;
  limited: boolean;
  limit?: number;
}

interface Update {
  id: number;
  title: string;
  content: string;
  date: string;
  likes: number;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-campaign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css']
})
export class CampaignComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  readonly currentTheme = this.themeService.theme;

  // Campaign data signal
  readonly campaign = signal<Campaign | null>(null);

  // Active tab signal
  readonly activeTab = signal<'story' | 'updates' | 'faqs'>('story');

  // Sample campaign data
  private readonly sampleCampaigns: Campaign[] = [
    {
      id: 1,
      title: 'Sustainable Energy Revolution',
      description: 'Revolutionary solar panel technology that reduces installation costs by 60% and increases efficiency by 40%.',
      fullDescription: `
        <h2>The Problem</h2>
        <p>The world is facing an energy crisis. Traditional solar panels are expensive to install and maintain, making renewable energy inaccessible to millions of households and businesses. Our current technology is stuck in the past, with efficiency rates that haven't improved significantly in decades.</p>

        <h2>Our Solution</h2>
        <p>We've developed a breakthrough solar panel technology that combines nanotechnology with advanced materials science. Our panels are:</p>
        <ul>
          <li><strong>60% cheaper to install</strong> due to simplified mounting systems</li>
          <li><strong>40% more efficient</strong> through quantum dot technology</li>
          <li><strong>Self-cleaning</strong> with hydrophobic coatings</li>
          <li><strong>25-year warranty</strong> with guaranteed performance</li>
        </ul>

        <h2>Why This Matters</h2>
        <p>Every household and business deserves access to clean, affordable energy. Our technology will accelerate the transition to renewable energy and help combat climate change. With your support, we can bring this technology to market and make sustainable energy accessible to everyone.</p>

        <h2>Our Team</h2>
        <p>We're a team of engineers, scientists, and entrepreneurs with decades of experience in renewable energy and materials science. Our lead engineer has worked at major solar companies and holds multiple patents in photovoltaic technology.</p>
      `,
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop',
      category: 'Technology',
      raised: 125000,
      goal: 200000,
      backers: 342,
      daysLeft: 15,
      creator: {
        name: 'GreenTech Innovations',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        bio: 'Leading the charge in sustainable energy solutions since 2018.',
        location: 'San Francisco, CA',
        projects: 3
      },
      rewards: [
        {
          id: 1,
          title: 'Early Supporter',
          description: 'Get early access to our technology updates and be featured in our supporter wall.',
          amount: 25,
          estimatedDelivery: 'December 2024',
          backers: 89,
          limited: false
        },
        {
          id: 2,
          title: 'Home Installation Kit',
          description: 'Complete solar panel installation kit for a standard home (up to 2kW system).',
          amount: 500,
          estimatedDelivery: 'March 2025',
          backers: 45,
          limited: true,
          limit: 100
        },
        {
          id: 3,
          title: 'Commercial Partnership',
          description: 'Partner with us for commercial installations. Includes consultation and custom solutions.',
          amount: 2500,
          estimatedDelivery: 'January 2025',
          backers: 12,
          limited: true,
          limit: 20
        }
      ],
      updates: [
        {
          id: 1,
          title: 'Prototype Testing Complete!',
          content: 'We\'re excited to announce that our prototype testing phase has been completed successfully. The results exceeded our expectations with 42% efficiency gains and 65% cost reduction in installation.',
          date: '2024-10-01',
          likes: 45
        },
        {
          id: 2,
          title: 'Partnership Announcement',
          content: 'We\'ve partnered with a leading materials science research institute to accelerate our development timeline. This collaboration will help us bring the product to market 3 months earlier.',
          date: '2024-09-15',
          likes: 32
        }
      ],
      faqs: [
        {
          question: 'When will the product be available?',
          answer: 'We expect to begin shipping to backers in Q1 2025, with general availability following in Q2 2025.'
        },
        {
          question: 'What is the warranty on the panels?',
          answer: 'All our panels come with a 25-year performance warranty and 10-year product warranty.'
        },
        {
          question: 'Can I install this myself?',
          answer: 'While DIY installation is possible for technically inclined users, we recommend professional installation for optimal performance and safety.'
        }
      ]
    }
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const campaign = this.sampleCampaigns.find(c => c.id === id);

    if (campaign) {
      this.campaign.set(campaign);
    } else {
      // Handle campaign not found
      this.router.navigate(['/explore']);
    }
  }

  // Methods
  setActiveTab(tab: 'story' | 'updates' | 'faqs') {
    this.activeTab.set(tab);
  }

  getProgressPercentage(): number {
    const campaign = this.campaign();
    if (!campaign) return 0;
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

  backProject(reward: Reward) {
    // Navigate to pledge page or open modal
    console.log('Backing project with reward:', reward);
  }

  shareCampaign() {
    if (navigator.share) {
      navigator.share({
        title: this.campaign()?.title,
        text: this.campaign()?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  goBack() {
    this.router.navigate(['/explorer']);
  }
}