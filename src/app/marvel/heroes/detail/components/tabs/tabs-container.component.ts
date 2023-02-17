import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { NgFor } from '@angular/common';
import { TabComponent } from './tab.component';

@Component({
	selector: 'app-tabs',
	standalone: true,
	imports: [NgFor],
	template: `
    <ul class="nav nav-tabs">
      <li class="nav-item cursor-pointer" *ngFor="let tab of tabs" (click)="selectTab(tab)">
        <span class="nav-link" [class.active]="tab.active">{{ tab.title }}</span>
      </li>
    </ul>
		<ng-content></ng-content>
	`
})
export class TabsContainer implements AfterContentInit {
	constructor() { }

	@ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  
  ngAfterContentInit() {
    let activeTabs = this.tabs?.filter((tab) => tab?.active);
    
    if (activeTabs?.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }
  
  selectTab(tab: any) {
    this.tabs.toArray().forEach(tab => tab.active = false);
    tab.active = true;
  }
}