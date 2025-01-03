// restaurant-card/restaurant-card.component.ts

import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-restaurant-card',
    templateUrl: './restaurant-card.component.html',
    standalone: true
})
export class RestaurantCardComponent {
    @Input() restaurant: any;
}
