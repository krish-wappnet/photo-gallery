import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router'; 
import { Album } from '../../models/album.model';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-list.component.html',
  styleUrls: ['./album-list.component.scss'] 
})
export class AlbumListComponent {
  albums: Album[] = [];
  newAlbumName: string = ''; // For form input
  welcomeMessage: string = 'Welcome to Your Photo Gallery!';
  instructions: string = 'Create albums to organize your favorite photos. Add photos using image URLs and explore them in a fullscreen viewer. Start by adding your first album below!';

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