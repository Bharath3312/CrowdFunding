import { Component, inject, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Component signals
  readonly isVisible = signal(false);
  readonly currentTheme = this.themeService.theme;

  // Stats data (could come from a service in a real app)
  readonly stats = [
    { value: '$2.5M+', label: 'Total Funded' },
    { value: '500+', label: 'Successful Projects' },
    { value: '10K+', label: 'Community Members' }
  ];

  // Features data
  readonly features = [
    {
      icon: 'lightning',
      title: 'Lightning Fast',
      description: 'Launch your campaign in minutes with our streamlined process and get funded quickly.'
    },
    {
      icon: 'shield',
      title: 'Secure & Transparent',
      description: 'Blockchain technology ensures every transaction is secure, transparent, and immutable.'
    },
    {
      icon: 'users',
      title: 'Community Driven',
      description: 'Connect with like-minded supporters and build a community around your project.'
    }
  ];

  // Steps data
  readonly steps = [
    {
      number: 1,
      title: 'Create Your Campaign',
      description: 'Set up your project with detailed information, funding goals, and timeline.'
    },
    {
      number: 2,
      title: 'Share & Promote',
      description: 'Spread the word about your campaign through social media and community channels.'
    },
    {
      number: 3,
      title: 'Receive Funding',
      description: 'Collect contributions securely through blockchain technology and bring your project to life.'
    }
  ];

  ngOnInit() {
    // Add intersection observer for scroll animations
    this.setupScrollAnimations();

    // Mark component as visible after a short delay for entrance animation
    setTimeout(() => {
      this.isVisible.set(true);
    }, 100);
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

      // Observe elements that should animate on scroll
      setTimeout(() => {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((el) => observer.observe(el));
      }, 100);
    }
  }

  // Navigation methods
  navigateToCreateCampaign() {
    this.router.navigate(['/create-campaign']);
  }

  navigateToExplorer() {
    this.router.navigate(['/explorer']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Theme methods
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}