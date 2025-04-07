import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Album, Photo } from '../../models/album.model';
import { StorageService } from '../../services/storage.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {
    this.loadPhoto();
  }

  private loadPhoto(): void {
    const albumId = this.route.snapshot.paramMap.get('albumId');
    const photoId = this.route.snapshot.paramMap.get('photoId');
    
    if (albumId && photoId) {
      this.album = this.storageService.getAlbums().find(a => a.id === albumId);
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
    }
  }

  previousPhoto(): void {
    if (this.album && this.currentPhoto) {
      this.photoIndex = (this.photoIndex - 1 + this.album.photos.length) % this.album.photos.length;
      this.currentPhoto = this.album.photos[this.photoIndex];
    }
  }

  toggleFavorite(): void {
    if (this.currentPhoto) {
      this.currentPhoto.isFavorite = !this.currentPhoto.isFavorite;
      this.updateStorage();
    }
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