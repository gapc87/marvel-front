import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MarvelService } from '../../marvel.service';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {

    @ViewChild('template1') template1!: TemplateRef<HTMLElement>;
    @ViewChild('template2') template2!: TemplateRef<HTMLElement>;
    @ViewChild('template3') template3!: TemplateRef<HTMLElement>;

    heroe: any;
    tabs: any[] = [{
        name: 'Resumen',
        active: false,
        available: 0,
        items: [{ name: '', description: '', thumbnail: {} }],
    }];
    selectedResource: string = 'comic';
    images: any = [];
    comic: any = {};
    serie: any = {};
    event: any = {};
    story: any = {};

    constructor(
        private _marvelSrv: MarvelService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.getAll(+params['id']);
        });
    }

    getAll(id: number) {
        this.getHeroe(id)
            .subscribe((data) => {
                data.pipe(
                    switchMap((res: any) => res),
                    tap((data: any) => {
                        combineLatest({ ...data }).pipe(
                            map((comics: any) => this.comicsToSlider(comics))
                        ).subscribe();
                    })
                ).subscribe();
            })
    }

    getHeroe(id: number) {
        return this._marvelSrv.getHeroe(id).pipe(
            switchMap((result: any) => result.data.results),
            map((heroe: any) => this.setTabs(heroe))
        );
    }

    setTabs(heroe: any): Observable<any> {
        this.tabs[0].items[0] = {
            name: heroe.name,
            description: heroe.description === '' ? 'Sin descripción.' : heroe.description,
            thumbnail: heroe.thumbnail,
        }

        this.tabs[0].outlet = this.template1;
        this.tabs[0].active = true;

        if (heroe.comics.available > 0) {
            this.setOneTab('Comics', false, heroe.comics.available, heroe.comics.items, this.template2);
        }

        if (heroe.series.available > 0) {
            this.setOneTab('Series', false, heroe.series.available, heroe.series.items, this.template2);
        }

        if (heroe.stories.available > 0) {
            this.setOneTab('Stories', false, heroe.stories.available, heroe.stories.items, this.template2);
        }

        if (heroe.events.available > 0) {
            this.setOneTab('Eventos', false, heroe.events.available, heroe.events.items, this.template2);
        }

        if (!!heroe.urls) {
            this.setOneTab('URLs', false, heroe.urls.length, heroe.urls, this.template3);
        }

        if (heroe.comics.available > 0) {
            const comics = Object.create({});
            const returnedComics = heroe.comics.returned;
            [...Array(returnedComics).keys()].forEach(i => {
                comics['comic' + (i + 1)] = this.getComic(heroe.comics.items[i].resourceURI);
            });

            return of([comics]);
        }

        return of([]);
    }

    setOneTab(name: string, active: boolean, available: number, items: [], outlet: TemplateRef<HTMLElement>) {
        this.tabs.push({ name, active, available, items, outlet });
    }

    getComic(resourceURI: string) {
        const id = +resourceURI.split('/').slice(-1)[0];
        return this._marvelSrv.getComic(id).pipe(
            map((result: any) => this.comic = result.data.results[0])
        );
    }

    getSerie(resourceURI: string) {
        const id = +resourceURI.split('/').slice(-1)[0];
        return this._marvelSrv.getSerie(id).pipe(
            map((result: any) => this.serie = result.data.results[0])
        );
    }

    getEvent(resourceURI: string) {
        const id = +resourceURI.split('/').slice(-1)[0];
        return this._marvelSrv.getEvent(id).pipe(
            map((result: any) => this.event = result.data.results[0])
        );
    }

    getStory(resourceURI: string) {
        const id = +resourceURI.split('/').slice(-1)[0];
        return this._marvelSrv.getStory(id).pipe(
            map((result: any) => this.story = result.data.results[0])
        );
    }

    get switchResource() {
        switch (this.selectedResource) {
            case 'comic':
                return this.comic;
            case 'serie':
                return this.serie;
            case 'event':
                return this.event;
            default:
                return this.story;
        }
    }

    getData(resourceUri: string) {
        const comic = resourceUri.indexOf('comics') !== -1;
        const serie = resourceUri.indexOf('stories') !== -1;
        const event = resourceUri.indexOf('events') !== -1;

        this.comic = {};
        this.serie = {};
        this.event = {};
        this.story = {};

        if (comic) {
            this.getComic(resourceUri).subscribe();
            this.selectedResource = 'comic';
        } else if (serie) {
            this.getSerie(resourceUri).subscribe();
            this.selectedResource = 'serie';
        } else if (event) {
            this.getEvent(resourceUri).subscribe();
            this.selectedResource = 'event';
        } else {
            this.getStory(resourceUri).subscribe();
            this.selectedResource = 'story';
        }
    }

    comicsToSlider(comics: any) {
        for (const property in comics) {
            this.images.push(comics[property].thumbnail);
        }

        return comics;
    }

    get sourceEmpty() {
        return Object.keys(this.switchResource).length === 0;
    }
}
