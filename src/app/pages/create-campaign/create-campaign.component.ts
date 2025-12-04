import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.css']
})
export class CreateCampaignComponent {
  
  previewFile(event: Event, previewId: string, fileType: 'image' | 'pdf'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }
    
    const previewContainer = document.getElementById(previewId);
    if (!previewContainer) {
      console.error('Preview container not found:', previewId);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (fileType === 'image') {
        const img = previewContainer.querySelector('img') as HTMLImageElement;
        if (img && e.target?.result) {
          img.src = e.target.result as string;
          previewContainer.classList.remove('hidden');
        }
      } else if (fileType === 'pdf') {
        const iframe = previewContainer.querySelector('iframe') as HTMLIFrameElement;
        const placeholder = previewContainer.querySelector('.p-4') as HTMLElement;
        if (iframe && e.target?.result) {
          iframe.src = e.target.result as string;
          iframe.classList.remove('hidden');
          if (placeholder) {
            placeholder.classList.add('hidden');
          }
          previewContainer.classList.remove('hidden');
        }
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
    };
    
    reader.readAsDataURL(file);
  }
  
  updateFundingTypeText(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const textContainer = document.getElementById('funding-type-text');
    const messageElement = document.getElementById('funding-message');
    
    if (!textContainer || !messageElement) return;
    
    if (select.value === 'fixed') {
      messageElement.textContent = 'Once campaign is full you can withdraw';
      textContainer.classList.remove('hidden');
    } else if (select.value === 'flexible') {
      messageElement.textContent = 'Can withdraw whatever amount invested';
      textContainer.classList.remove('hidden');
    } else {
      textContainer.classList.add('hidden');
    }
  }
  
  removePreview(previewId: string, inputId: string): void {
    const previewContainer = document.getElementById(previewId);
    const input = document.getElementById(inputId) as HTMLInputElement;
    
    if (previewContainer) {
      previewContainer.classList.add('hidden');
      const img = previewContainer.querySelector('img');
      const iframe = previewContainer.querySelector('iframe');
      const placeholder = previewContainer.querySelector('.p-4') as HTMLElement;
      
      if (img) img.src = '';
      if (iframe) {
        iframe.src = '';
        iframe.classList.add('hidden');
      }
      if (placeholder) {
        placeholder.classList.remove('hidden');
      }
    }
    
    if (input) {
      input.value = '';
    }
  }
}