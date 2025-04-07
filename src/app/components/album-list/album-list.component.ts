import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import { RouterModule } from '@angular/router'; // For routerLink
import { Album } from '../../models/album.model';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Add necessary modules
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.scss'] // Use styleUrls (plural)
})
export class AlbumListComponent {
  albums: Album[] = [];
  newAlbumName: string = ''; // For form input
  
  constructor(private storageService: StorageService) {
    this.albums = this.storageService.getAlbums();
  }

  addAlbum(): void {
    if (this.newAlbumName.trim()) {
      const newAlbum: Album = {
        id: Date.now().toString(),
        name: this.newAlbumName.trim(),
        createdDate: new Date(),
        photos: []
      };
      this.albums.push(newAlbum);
      this.storageService.saveAlbums(this.albums);
      this.newAlbumName = ''; // Reset input
    }
  }
}