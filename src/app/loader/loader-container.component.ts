import { Component } from '@angular/core';

import { NgIf } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
	selector: 'app-loader',
	standalone: true,
	imports: [NgIf],
	template: `
		<ng-template [ngIf]="_loaderSrv.loader">
			<div class="backdrop-loading d-flex justify-content-center align-items-center">
				<div class="spinner-border text-danger" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
		</ng-template>
	`
})
export class LoaderContainer {
	constructor(public _loaderSrv: LoaderService) { }
}