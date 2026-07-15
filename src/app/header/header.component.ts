import { Component, EventEmitter, Output } from '@angular/core';
import authorMenu from '../../assets/data/global/header/author-menu.json';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleMenu = new EventEmitter<void>();
  appAuthorMenu = authorMenu.appAuthorMenu;

  onToggle(): void {
    this.toggleMenu.emit();
  }

  signOut(): void {
    console.log('User signed out!');
  }
}
