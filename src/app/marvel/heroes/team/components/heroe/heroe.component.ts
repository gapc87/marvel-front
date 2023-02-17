import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, Observable, of, OperatorFunction, switchMap, tap } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { MarvelService } from 'src/app/marvel/marvel.service';

@Component({
  selector: 'app-heroe-of-team-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbTypeaheadModule],
  styles: [`
    .hero {
      background-repeat: no-repeat;
      background-position: center;
      background-color: #c7c7c7;
      background-size: 300px;
      min-height: 225px;
      min-width: 100px;
      padding: .5rem;
    }
  `],
  template: `
    <ng-template #rt let-r="result" let-t="term">
      <ngb-highlight [result]="r.name" [term]="t"></ngb-highlight>
    </ng-template>
    
    <div class="hero d-flex justify-content-center align-items-end rounded mb-3 mx-2" [style]="image">
      <input
            type="text"
            class="form-control"
            [formControl]="heroForm"
            [ngbTypeahead]="search"
            [resultTemplate]="rt"
            [inputFormatter]="formatter"
          />
    </div>
    
	`
})
export class HeroeComponent implements OnInit {

  @Input() hero_key!: any;

  heroForm: FormControl = new FormControl('');
  image?: string;

  constructor(
    private _marvelSrv: MarvelService,
    private _authSrv: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this._marvelSrv.heroes[this.hero_key].subscribe(heroe => {
      if (!!heroe && Object.keys(heroe).length !== 0) {
        this.heroForm.setValue(heroe, { emitEvent: false });
        this.image = `background-image: url('${heroe.thumbnail.path}.${heroe.thumbnail.extension}');`;
      } else if (!!heroe && this._marvelSrv.hasHeroInStorage(this.hero_key)) {
        const hero = this._marvelSrv.heroesFromStorage[this.hero_key];
        this.heroForm.setValue(hero, { emitEvent: false });
        this.image = `background-image: url('${hero['thumbnail']['path']}.${hero['thumbnail']['extension']}');`;
      } else {
        this.image = `background-image: url('/assets/none.webp');`;
      }
    });

    this.heroForm.valueChanges.pipe(
      debounceTime(1000),
      map(result => {
        if (!!result && result instanceof Object) {
          const team = Object.create({});
          team[this.hero_key] = result.id;
          this._authSrv.saveTeam(this.hero_key, team).subscribe();
          this._marvelSrv.setHeroes(this.hero_key, result);
          this.image = `background-image: url('${result.thumbnail.path}.${result.thumbnail.extension}');`;
        } else if (!!result && !isNaN(result)) {
          this._marvelSrv.getHeroe(result).pipe(
            map((result: any) => {
              const hero = result.data.results[0];
              this.heroForm.setValue(hero, { emitEvent: false });
              this.image = `background-image: url('${hero.thumbnail.path}.${hero.thumbnail.extension}');`;
            })
          ).subscribe();
        } else if (result === '') {
          this._authSrv.deleteHero(this.hero_key).pipe(
            tap(() => {
              this._marvelSrv.deleteHeroFromStorage(this.hero_key);
              this._marvelSrv.setHeroes(this.hero_key, null);
            })
          ).subscribe();
        }
      })
    ).subscribe();
  }

  search: OperatorFunction<any, any> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length === 0 || term.length < 3) {
          return of([]);
        }

        return this._marvelSrv.search(term).pipe(
          map((res: any) => res.data.results),
        )
      }),
    );

  formatter = (x: { name: string }) => x.name;
}