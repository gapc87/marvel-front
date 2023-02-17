import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListHeroesComponent } from './heroes/list-heroes/list-heroes.component';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ThumbnailPipe } from 'pipes/thumbnail.pipe';
import { NgbCarouselModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMasonryModule } from 'ngx-masonry';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeroeComponent as HeroForList } from './heroes/list-heroes/components/heroe/heroe.component';
import { HeroeComponent as HeroForTeam } from './heroes/team/components/heroe/heroe.component';
import { MarvelRoutingModule } from './marvel-routing.module';
import { DetailComponent } from './heroes/detail/detail.component';
import { TabsContainer } from "./heroes/detail/components/tabs/tabs-container.component";
import { TabComponent } from "./heroes/detail/components/tabs/tab.component";
import { TeamComponet } from './heroes/team/team.component';
import { AuthGuardService } from '../auth/auth-guard.service';


@NgModule({
    declarations: [
        ListHeroesComponent,
        ThumbnailPipe,
        DetailComponent,
        TeamComponet,
        HeroForList,
    ],
    exports: [
        ListHeroesComponent,
        ThumbnailPipe
    ],
    imports: [
        NgxMasonryModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InfiniteScrollModule,
        NgbTypeaheadModule,
        BrowserAnimationsModule,
        MarvelRoutingModule,
        TabsContainer,
        TabComponent,
        NgbCarouselModule,
        HeroForTeam,
    ],
    providers: [AuthGuardService],
})
export class MarvelModule { }

