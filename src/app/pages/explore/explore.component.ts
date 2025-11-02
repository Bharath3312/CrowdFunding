import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface Project {
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
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  readonly currentTheme = this.themeService.theme;

  // Sample projects data
  readonly projects = signal<Project[]>([
    {
      id: 1,
      title: 'Sustainable Energy Revolution',
      description: 'Revolutionary solar panel technology that reduces installation costs by 60% and increases efficiency by 40%.',
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=250&fit=crop',
      category: 'Technology',
      raised: 125000,
      goal: 200000,
      backers: 342,
      daysLeft: 15,
      creator: 'GreenTech Innovations'
    },
    {
      id: 2,
      title: 'Community Garden Network',
      description: 'Building urban community gardens to provide fresh, local produce and foster neighborhood connections.',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop',
      category: 'Community',
      raised: 45000,
      goal: 75000,
      backers: 156,
      daysLeft: 22,
      creator: 'Urban Harvest Collective'
    },
    {
      id: 3,
      title: 'AI-Powered Education Platform',
      description: 'Personalized learning platform using AI to adapt to each student\'s learning style and pace.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
      category: 'Education',
      raised: 89000,
      goal: 150000,
      backers: 278,
      daysLeft: 30,
      creator: 'EduTech Solutions'
    },
    {
      id: 4,
      title: 'Ocean Plastic Cleanup Device',
      description: 'Automated floating device that collects ocean plastic using currents and solar power.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop',
      category: 'Environment',
      raised: 180000,
      goal: 250000,
      backers: 567,
      daysLeft: 8,
      creator: 'Ocean Guardians'
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
      creator: 'MindCare Technologies'
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
      creator: 'Craft Connect'
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

  // Computed signal for filtered projects
  readonly filteredProjects = computed(() => {
    const category = this.selectedCategory();
    if (category === 'All') {
      return this.projects();
    }
    return this.projects().filter(project => project.category === category);
  });

  // Methods
  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  viewProject(projectId: number) {
    this.router.navigate(['/campaign', projectId]);
  }

  getProgressPercentage(project: Project): number {
    return Math.min((project.raised / project.goal) * 100, 100);
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