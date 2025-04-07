import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Album, Photo } from '../../models/album.model';
import { StorageService } from '../../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss']
})
export class PhotoViewerComponent {
  album?: Album;
  currentPhoto?: Photo;
  photoIndex: number = 0;
  isSlideshowActive: boolean = false;
  slideshowInterval?: any;
  scale: number = 1;
  translateX: number = 0;
  translateY: number = 0;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  albumId: string | null = null; // To store the album ID

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router // Added for navigation
  ) {
    this.loadPhoto();
  }

  private loadPhoto(): void {
    this.albumId = this.route.snapshot.paramMap.get('albumId'); // Store albumId
    const photoId = this.route.snapshot.paramMap.get('photoId');
    
    if (this.albumId && photoId) {
      this.album = this.storageService.getAlbums().find(a => a.id === this.albumId);
      if (this.album) {
        this.photoIndex = this.album.photos.findIndex(p => p.id === photoId);
        if (this.photoIndex !== -1) {
          this.currentPhoto = this.album.photos[this.photoIndex];
        }
      }
    }
  }

  nextPhoto(): void {
    if (this.album && this.currentPhoto) {
      this.photoIndex = (this.photoIndex + 1) % this.album.photos.length;
      this.currentPhoto = this.album.photos[this.photoIndex];
      this.resetZoom(); // Reset zoom when changing photos
    }
  }

  previousPhoto(): void {
    if (this.album && this.currentPhoto) {
      this.photoIndex = (this.photoIndex - 1 + this.album.photos.length) % this.album.photos.length;
      this.currentPhoto = this.album.photos[this.photoIndex];
      this.resetZoom(); // Reset zoom when changing photos
    }
  }

  toggleFavorite(): void {
    if (this.currentPhoto) {
      this.currentPhoto.isFavorite = !this.currentPhoto.isFavorite;
      this.updateStorage();
    }
  }

  toggleSlideshow(): void {
    if (!this.isSlideshowActive) {
      this.startSlideshow();
    } else {
      this.stopSlideshow();
    }
  }

  startSlideshow(): void {
    this.isSlideshowActive = true;
    this.slideshowInterval = setInterval(() => {
      this.nextPhoto();
    }, 3000); // Change photo every 3 seconds
  }

  stopSlideshow(): void {
    this.isSlideshowActive = false;
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }

  zoomIn(): void {
    this.scale += 0.1;
    if (this.scale > 3) this.scale = 3; // Max zoom limit
  }

  zoomOut(): void {
    this.scale -= 0.1;
    if (this.scale < 1) this.scale = 1; // Min zoom limit
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  goBack(): void {
    if (this.albumId) {
      this.router.navigate(['albums', this.albumId]); // Navigate to albums/:id
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.nextPhoto();
    if (event.key === 'ArrowLeft') this.previousPhoto();
    if (event.key === ' ') {
      event.preventDefault();
      this.toggleSlideshow();
    }
    if (event.key === '+') this.zoomIn();
    if (event.key === '-') this.zoomOut();
    if (event.key === '0') this.resetZoom();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isDragging = false;
  }

  private updateStorage(): void {
    if (this.album) {
      const albums = this.storageService.getAlbums();
      const index = albums.findIndex(a => a.id === this.album!.id);
      if (index !== -1) {
        albums[index] = this.album;
        this.storageService.saveAlbums(albums);
      }
    }
  }
}