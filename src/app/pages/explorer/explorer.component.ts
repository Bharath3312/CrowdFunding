import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  funded: number;
  goal: number;
  progress: number;
  daysLeft: number;
  creator: {
    name: string;
    verified: boolean;
  };
  tags: string[];
  createdAt: Date;
  featured: boolean;
}

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);

  // Component signals
  readonly currentTheme = this.themeService.theme;

  // Search and filter signals
  searchQuery = signal('');
  selectedCategory = signal('');
  sortBy = signal('newest');
  currentPage = signal(1);
  itemsPerPage = signal(12);

  // Active filters
  activeFilters = computed(() => {
    const filters: string[] = [];
    if (this.searchQuery()) filters.push(`"${this.searchQuery()}"`);
    if (this.selectedCategory()) filters.push(this.selectedCategory());
    return filters;
  });

  // Mock project data
  private allProjects = signal<Project[]>([
    {
      id: '1',
      title: 'Decentralized Exchange Protocol',
      description: 'A next-generation DEX with advanced liquidity management and cross-chain capabilities for seamless trading across multiple blockchains.',
      category: 'defi',
      funded: 250000,
      goal: 500000,
      progress: 50,
      daysLeft: 15,
      creator: { name: 'Alex Chen', verified: true },
      tags: ['DEX', 'Cross-chain', 'Liquidity'],
      createdAt: new Date('2024-01-15'),
      featured: true
    },
    {
      id: '2',
      title: 'NFT Marketplace Revolution',
      description: 'The ultimate NFT marketplace featuring AI-powered curation, fractional ownership, and sustainable minting practices.',
      category: 'nft',
      funded: 180000,
      goal: 300000,
      progress: 60,
      daysLeft: 22,
      creator: { name: 'Sarah Johnson', verified: true },
      tags: ['NFT', 'AI', 'Marketplace'],
      createdAt: new Date('2024-01-10'),
      featured: false
    },
    {
      id: '3',
      title: 'Blockchain Gaming Platform',
      description: 'Immersive gaming experience with true ownership of in-game assets, play-to-earn mechanics, and cross-game interoperability.',
      category: 'gaming',
      funded: 320000,
      goal: 400000,
      progress: 80,
      daysLeft: 8,
      creator: { name: 'Mike Rodriguez', verified: false },
      tags: ['Gaming', 'Play-to-earn', 'Assets'],
      createdAt: new Date('2024-01-08'),
      featured: true
    },
    {
      id: '4',
      title: 'Layer 2 Scaling Solution',
      description: 'High-performance Layer 2 network providing instant transactions and minimal fees for DeFi applications.',
      category: 'infrastructure',
      funded: 450000,
      goal: 600000,
      progress: 75,
      daysLeft: 30,
      creator: { name: 'Dr. Emily Watson', verified: true },
      tags: ['Layer 2', 'Scaling', 'Performance'],
      createdAt: new Date('2024-01-05'),
      featured: false
    },
    {
      id: '5',
      title: 'Decentralized Autonomous Organization',
      description: 'Community-governed platform for transparent decision-making and resource allocation in Web3 projects.',
      category: 'dao',
      funded: 120000,
      goal: 200000,
      progress: 60,
      daysLeft: 18,
      creator: { name: 'Community DAO', verified: true },
      tags: ['DAO', 'Governance', 'Community'],
      createdAt: new Date('2024-01-12'),
      featured: false
    },
    {
      id: '6',
      title: 'Sustainable Blockchain Initiative',
      description: 'Eco-friendly blockchain network using proof-of-stake with carbon-neutral mining and green energy partnerships.',
      category: 'social',
      funded: 95000,
      goal: 150000,
      progress: 63,
      daysLeft: 25,
      creator: { name: 'GreenChain Foundation', verified: true },
      tags: ['Sustainability', 'Green', 'Environment'],
      createdAt: new Date('2024-01-18'),
      featured: true
    },
    {
      id: '7',
      title: 'Privacy-Focused DeFi Protocol',
      description: 'Decentralized finance platform with advanced privacy features, zero-knowledge proofs, and confidential transactions.',
      category: 'defi',
      funded: 280000,
      goal: 350000,
      progress: 80,
      daysLeft: 12,
      creator: { name: 'Privacy Labs', verified: false },
      tags: ['Privacy', 'DeFi', 'Zero-knowledge'],
      createdAt: new Date('2024-01-20'),
      featured: false
    },
    {
      id: '8',
      title: 'AI-Powered NFT Generator',
      description: 'Create unique NFTs using artificial intelligence, with customizable traits and royalty management for creators.',
      category: 'nft',
      funded: 160000,
      goal: 250000,
      progress: 64,
      daysLeft: 20,
      creator: { name: 'ArtAI Studios', verified: true },
      tags: ['AI', 'NFT', 'Creativity'],
      createdAt: new Date('2024-01-22'),
      featured: false
    }
  ]);

  // Computed signals for filtering and sorting
  filteredProjects = computed(() => {
    let projects = this.allProjects();

    // Apply search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      projects = projects.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.creator.name.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (this.selectedCategory()) {
      projects = projects.filter(project => project.category === this.selectedCategory());
    }

    // Apply sorting
    projects = [...projects].sort((a, b) => {
      switch (this.sortBy()) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'funded':
          return b.funded - a.funded;
        case 'ending':
          return a.daysLeft - b.daysLeft;
        case 'popular':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return projects;
  });

  // Pagination
  paginatedProjects = computed(() => {
    const startIndex = 0;
    const endIndex = this.currentPage() * this.itemsPerPage();
    return this.filteredProjects().slice(startIndex, endIndex);
  });

  hasMoreProjects = computed(() =>
    this.paginatedProjects().length < this.filteredProjects().length
  );

  ngOnInit() {
    // Setup scroll animations
    this.setupScrollAnimations();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private setupScrollAnimations() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in-up');
            }
          });
        },
        { threshold: 0.1 }
      );

      setTimeout(() => {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((el) => observer.observe(el));
      }, 100);
    }
  }

  // Event handlers
  onSearchChange() {
    this.currentPage.set(1); // Reset pagination
  }

  onCategoryChange() {
    this.currentPage.set(1); // Reset pagination
  }

  onSortChange() {
    this.currentPage.set(1); // Reset pagination
  }

  removeFilter(filter: string) {
    if (filter.startsWith('"') && filter.endsWith('"')) {
      // Remove search query
      this.searchQuery.set('');
    } else {
      // Remove category filter
      this.selectedCategory.set('');
    }
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.sortBy.set('newest');
    this.currentPage.set(1);
  }

  loadMoreProjects() {
    this.currentPage.update(page => page + 1);
  }

  // Navigation
  viewProject(projectId: string) {
    // In a real app, this would navigate to project detail page
    console.log('Viewing project:', projectId);
    // this.router.navigate(['/project', projectId]);
  }

  // Utility methods
  trackByProjectId(_index: number, project: Project): string {
    return project.id;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}