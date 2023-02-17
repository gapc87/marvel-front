import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthModule } from './auth/auth.module';
import { ToastsContainer } from './toast/toasts-container.component';
import { LoaderContainer } from "./loader/loader-container.component";
import { MarvelModule } from "./marvel/marvel.module";
import { environment } from 'src/environments/environment';
import { BaseUrlInterceptor } from 'interceptors/base-url.interceptor';
import { AuthInterceptor } from 'interceptors/auth.interceptor';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EquipoComponent } from './components/equipo/equipo.component';
import { HeroeComponent as HeroeForNav } from './components/equipo/heroe.component';

@NgModule({
  declarations: [
    AppComponent,
    EquipoComponent,
    HeroeForNav
  ],
  bootstrap: [AppComponent],
  providers: [{
    provide: "BASE_AUTH_API_URL", useValue: environment.authApiUrl
  }, {
    provide: "BASE_MARVEL_API", useValue: environment.marvel
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: BaseUrlInterceptor,
    multi: true,
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  }],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    NgbModule,
    AuthModule,
    ToastsContainer,
    LoaderContainer,
    MarvelModule,
    InfiniteScrollModule,
    AppRoutingModule,
  ]
})
export class AppModule { }
