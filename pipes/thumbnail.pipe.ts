import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thumbnail'
})
export class ThumbnailPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {
    return `${value?.path}.${value?.extension}`;
  }
}
