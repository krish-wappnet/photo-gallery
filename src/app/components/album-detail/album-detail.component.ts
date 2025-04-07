import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  newPhotoTags: string = ''; // For comma-separated tag input
  welcomeMessage: string = 'Explore Your Album!';
  instructions: string = 'Add photos to this album using their URLs, tag them, sort by date or name, edit details, or delete them. Filter by tags or use bulk actions!';
  editingPhotoId: string | null = null;
  editTitle: string = '';
  editUrl: string = '';
  editTags: string = ''; // For editing tags
  filterTag: string = ''; // For filtering by tag
  selectedPhotoIds: string[] = []; // For bulk actions
  showModal: boolean = false;
  selectedPhoto: Photo | null = null;

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

  openModal(photo: Photo): void {
    this.selectedPhoto = { ...photo };
    this.showModal = true;
  }

  closeModal(event: MouseEvent): void {
    event.stopPropagation();
    this.showModal = false;
    this.selectedPhoto = null;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  addPhoto(): void {
    if (this.album && this.newPhotoUrl && this.newPhotoTitle) {
      const photo: Photo = {
        id: Date.now().toString(),
        url: this.newPhotoUrl,
        title: this.newPhotoTitle,
        dateAdded: new Date(),
        isFavorite: false,
        tags: this.getTagsFromString(this.newPhotoTags)
      };
      this.album.photos.push(photo);
      this.updateStorage();
      this.newPhotoUrl = '';
      this.newPhotoTitle = '';
      this.newPhotoTags = '';
    }
  }

  deletePhoto(photoId: string): void {
    if (this.album) {
      this.album.photos = this.album.photos.filter(photo => photo.id !== photoId);
      this.selectedPhotoIds = this.selectedPhotoIds.filter(id => id !== photoId);
      this.updateStorage();
    }
  }

  startEdit(photo: Photo): void {
    this.editingPhotoId = photo.id;
    this.editTitle = photo.title;
    this.editUrl = photo.url;
    this.editTags = photo.tags?.join(', ') || ''; // Join multiple tags for editing
  }

  saveEdit(): void {
    if (this.album && this.editingPhotoId) {
      const photo = this.album.photos.find(p => p.id === this.editingPhotoId);
      if (photo) {
        photo.title = this.editTitle;
        photo.url = this.editUrl;
        photo.tags = this.getTagsFromString(this.editTags);
        this.updateStorage();
      }
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingPhotoId = null;
    this.editTitle = '';
    this.editUrl = '';
    this.editTags = '';
  }

  sortPhotos(): void {
    if (this.album) {
      this.album.photos.sort((a, b) =>
        this.sortBy === 'date'
          ? b.dateAdded.getTime() - a.dateAdded.getTime()
          : a.title.localeCompare(b.title)
      );
      this.updateStorage();
    }
  }

  filterPhotos(): Photo[] {
    if (!this.album || !this.filterTag) return this.album?.photos ?? [];
    return this.album.photos.filter(photo =>
      photo.tags?.includes(this.filterTag) ?? false
    );
  }

  togglePhotoSelection(photoId: string): void {
    const index = this.selectedPhotoIds.indexOf(photoId);
    if (index === -1) {
      this.selectedPhotoIds.push(photoId);
    } else {
      this.selectedPhotoIds.splice(index, 1);
    }
  }

  bulkDelete(): void {
    if (this.album && this.selectedPhotoIds.length > 0) {
      this.album.photos = this.album.photos.filter(photo => !this.selectedPhotoIds.includes(photo.id));
      this.selectedPhotoIds = [];
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

  // Remove a specific tag during editing
  removeTag(tagToRemove: string): void {
    if (this.editingPhotoId && this.album) {
      const photo = this.album.photos.find(p => p.id === this.editingPhotoId);
      if (photo && photo.tags) {
        photo.tags = photo.tags.filter(tag => tag !== tagToRemove);
        this.editTags = photo.tags.join(', '); // Update the input field
        this.updateStorage();
      }
    }
  }

  // Update tags in real-time as user types during editing
  updateTags(): void {
    if (this.editingPhotoId && this.album) {
      const photo = this.album.photos.find(p => p.id === this.editingPhotoId);
      if (photo) {
        const newTags = this.getTagsFromString(this.editTags);
        photo.tags = newTags;
        this.updateStorage();
      }
    }
  }

  // Remove a specific tag during upload
  removeNewTag(tagToRemove: string): void {
    const tagsArray = this.getTagsFromString(this.newPhotoTags);
    const index = tagsArray.indexOf(tagToRemove);
    if (index !== -1) {
      tagsArray.splice(index, 1);
      this.newPhotoTags = tagsArray.join(', ');
    }
  }

  // Update tags in real-time as user types during upload
  updateNewTags(): void {
    // This method is called on input, but we only need to ensure the display updates
    // The actual saving happens in addPhoto()
  }

  // Helper method to process tags from a string
  private getTagsFromString(tagsString: string): string[] {
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  // Getter to get the current tags array for display
  get newTagsArray(): string[] {
    return this.getTagsFromString(this.newPhotoTags);
  }

  // Getter to get the current tags array for editing display
  get editTagsArray(): string[] {
    if (this.editingPhotoId && this.album) {
      const photo = this.album.photos.find(p => p.id === this.editingPhotoId);
      return photo ? this.getTagsFromString(photo.tags?.join(', ') || '') : [];
    }
    return this.getTagsFromString(this.editTags);
  }
}