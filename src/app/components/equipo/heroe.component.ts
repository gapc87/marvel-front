import { Component, Input, OnInit } from '@angular/core';
import { MarvelService } from 'src/app/marvel/marvel.service';

@Component({
  selector: 'app-heroe-for-nav',
  styles: [`
    img {
      max-height: 200px;
      min-width: 200px;
    }
  `],
  template: `
    <a [routerLink]="link">
      <img class="img-fluid rounded" [src]="image">
    </a>
  `
})
export class HeroeComponent implements OnInit {

  @Input() hero_key!: any;

  image!: string;
  link!: string[];

  constructor(private _marvelSrv: MarvelService) { }

  ngOnInit(): void {
    this._marvelSrv.heroes[this.hero_key].subscribe(heroe => {
      if (!!heroe && Object.keys(heroe).length !== 0) {
        this.image = `${heroe.thumbnail.path}.${heroe.thumbnail.extension}`;
        this.link = ['/heroe', heroe.id];
      } else if (!!heroe && this._marvelSrv.hasHeroInStorage(this.hero_key)) {
        const hero = this._marvelSrv.heroesFromStorage[this.hero_key];
        this.image = `${hero['thumbnail']['path']}.${hero['thumbnail']['extension']}`;
        this.link = ['/heroe', hero['id']];
      } else {
        this.image = `assets/none.webp`;
        this.link = ['/mi-equipo'];
      }
    });
  }
}