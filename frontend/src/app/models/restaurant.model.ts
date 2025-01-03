//models/restaurant.model.ts

export interface Restaurant {
    _id?: string;
    name: string;
    address: string;
    contact: string;
    location: string;
    rating: number;
    offers: boolean;
    cuisines: string[];
    image: string;
}
