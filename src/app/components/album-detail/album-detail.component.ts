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
      // Reset form inputs
      this.newPhotoUrl = '';
      this.newPhotoTitle = '';
    }
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