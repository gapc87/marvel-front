import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-heroe-component',
    templateUrl: './heroe.component.html',
    styleUrls: ['./heroe.component.scss']
})
export class HeroeComponent {
    @Input() i?: number;
    @Input() name?: string;
    @Input() description?: string;
    @Input() modified?: string|null;
    @Input() thumbnail?: any;
    @Input() backBackground?: string;
}
