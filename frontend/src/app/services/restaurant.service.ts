//services/restaurant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
    providedIn: 'root',
})
export class RestaurantService {
    //private apiUrl =  environment.apiUrl || 'http://backend-service.restaurant.svc.cluster.local:4000/api/restaurants';
    //private apiUrl = 'http://host.docker.internal:4000/api/restaurants';
    //private apiUrl = environment.apiUrl; // Use environment.apiUrl directly 'http://backend-service.restaurant.svc.cluster.local:4000/api/restaurants'
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getRestaurants(
        location: string = '',
        rating: number = 0,
        sortBy: string = 'name',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Observable<Restaurant[]> {
        let params = new HttpParams();
        if (location) {
            params = params.set('location', location);
        }
        if (rating > 0) {
            params = params.set('rating', 
            rating.toString());
        }
        params = params.set('sortBy', sortBy);
        params = params.set('sortOrder', sortOrder);

        return this.http.get<Restaurant[]>
        (this.apiUrl, { params });
    }

    createRestaurant(restaurant: Restaurant):
     Observable<Restaurant> {
        return this.http.post<Restaurant>
        (this.apiUrl, restaurant);
    }

    updateRestaurant(
        id: string,
        updatedRestaurant: Restaurant
    ): Observable<Restaurant> {
        return this.http.put<Restaurant>
        (`${this.apiUrl}/${id}`, updatedRestaurant);
    }

    deleteRestaurant(id: string): Observable<void> {
        return this.http.delete<void>
        (`${this.apiUrl}/${id}`);
    }
}
