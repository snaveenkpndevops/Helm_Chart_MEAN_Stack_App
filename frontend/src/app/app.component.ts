import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RestaurantCardComponent } from './components/restaurant-card/restaurant-card.component';
import { environment } from '../environments/environment'; // Import environment

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [
        NavbarComponent,
        RestaurantCardComponent,
        ReactiveFormsModule,
        CommonModule,
        HttpClientModule // Add HttpClientModule here
    ],
    standalone: true,
})
export class AppComponent implements OnInit {
    title = 'Restro - find your restaurant';
    location = new FormControl('');
    rating = new FormControl('');
    selectedCuisines: string[] = [];
    restaurants: any[] = [];
    filteredRestaurants: any[] = [];

    private apiUrl = environment.apiUrl;  // Use the apiUrl from environment.ts

    options = [
        { value: 'North Indian', label: 'North Indian' },
        { value: 'South Indian', label: 'South Indian' },
        { value: 'Chinese', label: 'Chinese' },
        { value: 'Desserts', label: 'Desserts' },
        { value: 'Italian', label: 'Italian' },
        { value: 'Oriental', label: 'Oriental' },
        { value: 'Pastas', label: 'Pastas' },
        { value: 'Pizzas', label: 'Pizzas' },
        { value: 'Japanese', label: 'Japanese' },
        { value: 'Sushi', label: 'Sushi' },
        { value: 'Barbecue', label: 'Barbecue' },
        { value: 'Steak', label: 'Steak' },
        { value: 'Seafood', label: 'Seafood' },
    ];

    constructor(private http: HttpClient) { }   

    ngOnInit() {
        this.getRestaurants();
    }

    getRestaurants() {
        // this.http.get('http://host.docker.internal:4000/api/restaurants')  
        // this.http.get('http://localhost:4000/api/restaurants')       
        //this.http.get(this.apiUrl).subscribe(
        
        this.http.get(this.apiUrl).subscribe(
            (response: any) => {
                if (response.success) {
                    this.restaurants = response.data;
                    this.filterRestaurants();
                }
            },
            (error) => {
                console.log('Error:', error);
            }
        );
    }

    filterRestaurants() {
        this.filteredRestaurants = this.restaurants.filter((restaurant) => {
            const locationMatch = this.location.value
                ? restaurant.location === this.location.value
                : true;
            const ratingMatch = this.rating.value
                ? restaurant.rating >= parseInt(this.rating.value)
                : true;
            const cuisineMatch =
                this.selectedCuisines.length > 0
                    ? this.selectedCuisines.every((cuisine) =>
                        restaurant.cuisines.includes(cuisine)
                    )
                    : true;
            return locationMatch && ratingMatch && cuisineMatch;
        });
    }

    toggleCuisine(cuisine: string) {
        const index = this.selectedCuisines.indexOf(cuisine);
        if (index === -1) {
            this.selectedCuisines.push(cuisine);
        } else {
            this.selectedCuisines.splice(index, 1);
        }
        this.filterRestaurants();
    }
}
