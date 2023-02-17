import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { tap, interval as observableInterval, scan, takeWhile, filter, map } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasConfig } from '@ng-bootstrap/ng-bootstrap';

const MENU: any[] = [
  { name: 'Home', requiredAuth: false, route: '/' },
  { name: 'Mi equipo', requiredAuth: true, route: 'mi-equipo' }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  last_scroll_top: number = 0;

  @ViewChild('wrapper')
  wrapper!: ElementRef<HTMLDivElement>;

  @ViewChild('navbar')
  navbar!: ElementRef<HTMLDivElement>;

  authForm: boolean = false;

  constructor(
    config: NgbOffcanvasConfig,
    private offcanvasService: NgbOffcanvas,
    private _authSrv: AuthenticationService,
    private router: Router
  ) {
    config.position = 'end';
    config.panelClass = 'bg-dark';
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationEnd),
      tap(() => {
        this.offcanvasService.dismiss();
        this.toTop();
      })
    ).subscribe();
  }

  openOffcanvas(content: any) {
    this.offcanvasService.open(content);
  }

  get menu() {
    return MENU.filter(m => !this.isLoggedIn ? !m.requiredAuth : m.requiredAuth || !m.requiredAuth);
  }

  logout() {
    this._authSrv.logout();
    this.router.navigate(['/']);
  }

  get isLoggedIn() {
    return this._authSrv.isLoggedIn;
  }

  onScrollEvent(_$event: any) {
    let scroll_top = this.wrapper.nativeElement.scrollTop;
    if (scroll_top < this.last_scroll_top) {
      this.navbar.nativeElement.classList.remove('scrolled-down');
      this.navbar.nativeElement.classList.add('scrolled-up');
    }
    else {
      this.navbar.nativeElement.classList.remove('scrolled-up');
      this.navbar.nativeElement.classList.add('scrolled-down');
    }
    this.last_scroll_top = scroll_top;
  }

  toggleAuthForm(event: boolean) {
    this.authForm = event;
  }

  toTop(): void {
    const duration = 600;
    const interval = 5;
    const move = this.wrapper.nativeElement.scrollTop * interval / duration;
    observableInterval(interval).pipe(
      scan((acc, _curr) => acc - move, this.wrapper.nativeElement.scrollTop),
      tap(position => this.wrapper.nativeElement.scrollTop = position),
      takeWhile(val => val > 0)).subscribe();
  }
}
