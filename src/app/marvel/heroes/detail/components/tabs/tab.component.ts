import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab',
  standalone: true,
  styles: [
    `
    .pane{
      padding: 1em;
    }
  `
  ],
  template: `
    <div [hidden]="!active" class="pane border border-top-0">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input('tabTitle') title?: string;
  @Input() active = false;
  @Input() available = 0;
  @Input() items = [];
}
