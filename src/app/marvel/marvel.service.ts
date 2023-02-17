import { HttpClient, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, } from 'rxjs';
import { ToastService } from '../toast/toasts.service';

import { API_AUTH, API_MARVEL } from 'common/constants';

@Injectable({
  providedIn: 'root'
})
export class MarvelService {

  private ts: string = '';
  private marvelHashStr: string = '';

  private heroesSubject: {[key: string]: BehaviorSubject<any>} = {
    hero_1: new BehaviorSubject(this.heroesFromStorage['hero_1']),
    hero_2: new BehaviorSubject(this.heroesFromStorage['hero_2']),
    hero_3: new BehaviorSubject(this.heroesFromStorage['hero_3']),
    hero_4: new BehaviorSubject(this.heroesFromStorage['hero_4']),
    hero_5: new BehaviorSubject(this.heroesFromStorage['hero_5']),
    hero_6: new BehaviorSubject(this.heroesFromStorage['hero_6']),
  };

  public readonly heroes: {[key: string]: Observable<any>} = {
    hero_1: this.heroesSubject['hero_1'].asObservable(),
    hero_2: this.heroesSubject['hero_2'].asObservable(),
    hero_3: this.heroesSubject['hero_3'].asObservable(),
    hero_4: this.heroesSubject['hero_4'].asObservable(),
    hero_5: this.heroesSubject['hero_5'].asObservable(),
    hero_6: this.heroesSubject['hero_6'].asObservable(),
  };

  constructor(private http: HttpClient, private toastSrv: ToastService) { }

  get heroesFromStorage(): { [key: string]: any|null } {
    return {
      hero_1: this.hasHeroInStorage('hero_1') ? JSON.parse(this.getHeroFromStorage('hero_1')!) : null,
      hero_2: this.hasHeroInStorage('hero_2') ? JSON.parse(this.getHeroFromStorage('hero_2')!) : null,
      hero_3: this.hasHeroInStorage('hero_3') ? JSON.parse(this.getHeroFromStorage('hero_3')!) : null,
      hero_4: this.hasHeroInStorage('hero_4') ? JSON.parse(this.getHeroFromStorage('hero_4')!) : null,
      hero_5: this.hasHeroInStorage('hero_5') ? JSON.parse(this.getHeroFromStorage('hero_5')!) : null,
      hero_6: this.hasHeroInStorage('hero_6') ? JSON.parse(this.getHeroFromStorage('hero_6')!) : null,
    };
  }

  private getHeroFromStorage(key: string): string|null {
    return localStorage.getItem(key);
  }

  hasHeroInStorage(key: string): boolean {
    return !!localStorage.getItem(key);
  }

  setHeroes(key: string, heroe: any): void {
    this.heroesSubject[key].next(heroe);
    this.setHeroInStorage(key, heroe);
  }

  marvelHash(publicKey: string): Observable<any> {
    const options: HttpParamsOptions = { fromObject: { publicKey } };
    return this.http.get<{ publicKey: string }>(`${API_AUTH}/marvel-hash`, {
      params: new HttpParams(options)
    });
  }

  setMarvelHash(hash: string): void {
    this.marvelHashStr = hash;
  }

  get hasMarvelHash(): boolean {
    return !!this.marvelHashStr;
  }

  get getMarvelHash(): string {
    return this.marvelHashStr;
  }

  setMarvelTs(ts: string): void {
    this.ts = ts;
  }

  get hasMarvelTs(): boolean {
    return !!this.ts;
  }

  get getMarvelTs(): string {
    return this.ts;
  }

  setMarvel(marvel: any): void {
    this.marvelHashStr = marvel.hash;
    this.ts = marvel.ts;
  }

  getHeroes(offset: number): Observable<any> {
    return this.http.get(`${API_MARVEL}/characters?limit=10&offset=${offset}`);
  }

  search(term: string): Observable<any> {
		if (term === '' && term.length <= 2) {
			return of([]);
		}

		return this.http.get(`${API_MARVEL}/characters?limit=10&nameStartsWith=${term}`);
	}

  getHeroe(id: number): Observable<any> {
    return this.http.get(`${API_MARVEL}/characters/${id}`);
  }

  getComic(id: number): Observable<any> {
    return this.http.get(`${API_MARVEL}/comics/${id}`);
  }

  getSerie(id: number): Observable<any> {
    return this.http.get(`${API_MARVEL}/series/${id}`);
  }
  
  getEvent(id: number): Observable<any> {
    return this.http.get(`${API_MARVEL}/events/${id}`);
  }
  
  getStory(id: number): Observable<any> {
    return this.http.get(`${API_MARVEL}/stories/${id}`);
  }

  setHeroInStorage(key: string, hero: any): void {
    localStorage.setItem(key, JSON.stringify(hero));
  }

  deleteHeroFromStorage(hero: string): void {
    localStorage.removeItem(hero);
  }

  deleteAllHeroesFromStorage(): void {
    ['hero_1', 'hero_2', 'hero_3', 'hero_4', 'hero_5', 'hero_6'].forEach((hero: string) => {
      if (!!localStorage.getItem(hero))
        localStorage.removeItem(hero);
    })
  }
}
