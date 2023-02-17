import { Component, EventEmitter, Output } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { MarvelService } from 'src/app/marvel/marvel.service';

@Component({
  selector: 'app-equipo-component',
  styles: [`
    .v-center {
      z-index: 1;
    }

    .team {
      scrollbar-width: none;
      overflow: auto;
    }

    @media screen and (min-width: 1200px) {
      .v-center {
        max-height: calc(100vh - 100px);
        transform: translateY(22px);
        top: 65px;
      }

      .team::-webkit-scrollbar {
        width: 0;
      }
    }

    ul {
      align-items: center;
      list-style: none;
      display: flex;
      width: 100%;
      padding: 0;
      margin: 0;
    }

    li {
      margin: auto .25rem;
    }

    @media screen and (min-width: 1200px) {
      ul {
        flex-direction: column;
      }

      li {
        margin: .25rem auto;
      }
    }
  `],
  templateUrl: './equipo.component.html'
})
export class EquipoComponent {

  @Output() toTopEvent = new EventEmitter();

  constructor(
    public _marvelSrv: MarvelService,
    private _authSrv: AuthenticationService,
  ) { }

  
  toTop() {
    this.toTopEvent.emit();
  }

  get isLoggedIn() {
    return this._authSrv.isLoggedIn;
  }
}