import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import { Album, Photo } from '../../models/album.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.scss'] 
})

export class AlbumDetailComponent {
  album?: Album; 
  sortBy: 'date' | 'name' = 'date';
  newPhotoUrl: string = ''; 
  newPhotoTitle: string = ''; 
  welcomeMessage: string = 'Explore Your Album!';
  instructions: string = 'Add photos to this album using their URLs, sort them by date or name, edit their details, or delete them. Click a photo to view it in fullscreen. Start by adding your first photo below!';
  editingPhotoId: string | null = null; 
  editTitle: string = ''; 
  editUrl: string = ''; 
  selectedPhoto: Photo | null = null; // Track selected photo for modal
  showModal: boolean = false; // Modal state

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {
    this.loadAlbum();
  }

  private loadAlbum(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.album = this.storageService.getAlbums().find(a => a.id === id);
    }
  }

  // Open modal with selected photo
  openModal(photo: Photo): void {
    this.selectedPhoto = { ...photo }; // Create a copy to avoid direct mutation
    this.showModal = true;
  }

  // Close modal, accepting event parameter
  closeModal(event: MouseEvent): void {
    event.stopPropagation(); // Stop propagation when clicking the modal background
    this.showModal = false;
    this.selectedPhoto = null;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  // Existing methods (addPhoto, deletePhoto, etc.) remain unchanged
  addPhoto(): void {
    if (this.album && this.newPhotoUrl && this.newPhotoTitle) {
      const photo: Photo = {
        id: Date.now().toString(),
        url: this.newPhotoUrl,
        title: this.newPhotoTitle,
        dateAdded: new Date(),
        isFavorite: false,
        tags: []
      };
      this.album.photos.push(photo);
      this.updateStorage();
      this.newPhotoUrl = '';
      this.newPhotoTitle = '';
    }
  }

  deletePhoto(photoId: string): void {
    if (this.album) {
      this.album.photos = this.album.photos.filter(photo => photo.id !== photoId);
      this.updateStorage();
    }
  }

  startEdit(photo: Photo): void {
    this.editingPhotoId = photo.id;
    this.editTitle = photo.title;
    this.editUrl = photo.url;
  }

  saveEdit(): void {
    if (this.album && this.editingPhotoId) {
      const photo = this.album.photos.find(p => p.id === this.editingPhotoId);
      if (photo && (this.editTitle !== photo.title || this.editUrl !== photo.url)) {
        photo.title = this.editTitle;
        photo.url = this.editUrl;
        this.updateStorage();
      }
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingPhotoId = null;
    this.editTitle = '';
    this.editUrl = '';
  }

  sortPhotos(): void {
    if (this.album) {
      this.album.photos.sort((a, b) =>
        this.sortBy === 'date'
          ? b.dateAdded.getTime() - a.dateAdded.getTime()
          : a.title.localeCompare(b.title)
      );
      this.updateStorage(); // Persist sorted order
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