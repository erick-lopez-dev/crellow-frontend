
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByPosition'
})
export class SortByPositionPipe implements PipeTransform {
  transform(items: any[]): any[] {
    if (!items) return [];
    return items.slice().sort((a, b) => a.position - b.position);
  }
}