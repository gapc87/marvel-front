import { Component, OnInit } from '@angular/core';
import { MarvelService } from '../../marvel.service';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, OperatorFunction, switchMap, tap } from 'rxjs';
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-list-heroes',
    templateUrl: './list-heroes.component.html',
    styleUrls: ['./list-heroes.component.scss']
})
export class ListHeroesComponent implements OnInit {

    heroes: any[] = [];

    // Buscador
    model: any;
    searching = false;
    searchFailed = false;
    heroesFromSearch = false;

    formatter = (x: { name: string }) => x.name;

    constructor(
        private _marvelSrv: MarvelService,
        config: NgbTypeaheadConfig,
    ) {
        config.showHint = false;
    }

    ngOnInit(): void {
        this.getHeroes();
    }

    getHeroes() {
        if (!this.heroesFromSearch) {
            this._marvelSrv.getHeroes(this.heroes.length).pipe(
                tap(() => this.heroesFromSearch = false),
                switchMap(res => res.data.results),
                map((heroe) => {
                    this.heroes.push(heroe);

                })
            ).subscribe();
        }
    }

    search: OperatorFunction<any, any> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => {
                this.heroesFromSearch = true;
                this.searching = true;
            }),
            switchMap((term) => {
                if (term.length === 0) {
                    this.heroesFromSearch = false;
                    this.heroes = [];
                    this.getHeroes();
                    return of([]);
                }

                return this._marvelSrv.search(term).pipe(
                    tap(() => {
                        this.searchFailed = false;
                        this.heroes = [];
                    }),
                    map((res: any) => res.data.results),
                    switchMap((heroes) => {
                        this.heroes.push(...heroes);
                        return of([]);
                    }),
                    catchError(() => {
                        this.searchFailed = true;
                        return of([]);
                    }),
                )
            }),
            tap(() => (this.searching = false)),
        );
}
