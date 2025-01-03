## Frontend (Angular) 

FYI: 

  ```
  Backend Repo URL : https://github.com/snaveenkpndevops/MEAN_Stack_Restaurant_App_Backend
  ```

Reference from geeks for geeks : https://www.geeksforgeeks.org/restaurant-recommendation-app-using-mean/

MEAN STACK  --> Mongo Express Angular Node.js

## Installation of Angular packages and and code (Also Running the application in Local machine)

1. npm install -g @angular/cli@16.0.0  -->  Run the following command to install Angular CLI globally

2. ng new frontend --version=16.0.0    -->  Create Angular App named frontend

3. paste all the code (refer geeks for geeks documents)

   ### Reference from geeks for geeks : https://www.geeksforgeeks.org/restaurant-recommendation-app-using-mean/

4. ng serve  --> Start the Angular App using the following command.

5. our frontend is running in `http://localhost:4200`

6. In frontend inside `app.component.ts` we configured the backend ip and port inside getRestaurants().
      Backend is running in port 4000.

      ```
       getRestaurants() {
        this.http.get('http://localhost:4000/api/restaurants')
      ```

7. For kubernetes environment, we need to change the backend url for connection.

   * In `restaurant.service.ts` update the backend url based on kubernetes backend service name. For example, if your backend service is called `express-backend-service`, you can update the API URL in restaurant.service.ts as follows:

   ```
      // Change the apiUrl to the internal DNS if the frontend is inside the same Kubernetes cluster
     private apiUrl = 'http://express-backend-service.default.svc.cluster.local/api/restaurants';  // Internal Kubernetes DNS
     private apiUrl = 'http://localhost:3000/api/restaurants';    // For local connection we can use this.
   ```

   * Best practice is to use environment variable and get the private apiUrl from enviroment variables. so in `app.component.ts` and in `restaurant.service.ts`. 

      create a /src/environment/environment.ts      -->  for dev environment

      create a /src/environment/environment.ts.prod    -->  for prod environment

      ```
      // /src/environment/environment.ts 

      export const environment = {
      production: false,
      apiUrl: 'http://localhost:4000/api/restaurants'
      };

      ```

      ```
      // /src/environment/environment.ts.prod
      
      export const environment = {
      production: true,
      apiUrl: 'http://localhost:4000/api/restaurants'
      };
  
      ```
When you build the Angular application, it will use the correct environment file based on the build configuration. For example:

`ng build --prod    // This will use environment.prod.ts`

`ng build           // This will use environment.ts`

   * In `restaurant.service.ts` we need to import environment and update the private apiUrl.

      ```
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
            private apiUrl =  environment.apiUrl || 'http://localhost:4000/api/restaurants';
            //private apiUrl = 'http://host.docker.internal:4000/api/restaurants';

      ```

   * same like that in `app.component.ts` we need to import environment and update the private apiUrl.

      ```
      import { environment } from '../environments/environment'; // Import environment

         getRestaurants() {
         // this.http.get('http://host.docker.internal:4000/api/restaurants')  
         // this.http.get('http://localhost:4000/api/restaurants')
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

      ```

### Note:

      1. We are using angular default port 4200 to access our frontend. To change the port we need to edit `angular.json` file.
      2. In angular we need to use environment.ts and environment.prod.ts  file. Angular doesn't provide runtime environment variables directly.

8. if we want to customize our nginx port -->  create nginx.conf file and modify the port to 4200 and update the dockerfile.


## Note:

## Dockerize the frontend application:

### Prerequisite:

   * make sure your docker-desktop application is running.

   * Make sure environment variables are configured inside /src/environment/environment.ts  and /src/environment/environment.ts.prod correctly.


   ```

      // /src/environment/environment.ts 

      export const environment = {
      production: false,
      apiUrl: 'http://localhost:4000/api/restaurants'
      };

   ```


   ```

      // /src/environment/environment.ts.prod
      
      export const environment = {
      production: true,
      apiUrl: 'http://localhost:4000/api/restaurants'
      };

   ```

* In `app.component.ts` for dockerize application 


   ```

      import { environment } from '../environments/environment'; // Import environment

         getRestaurants() {
         // this.http.get('http://host.docker.internal:4000/api/restaurants')  
         // this.http.get('http://localhost:4000/api/restaurants')
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
   ```

* In `restaurant.service.ts` for dockerize application 


   ```
      import { environment } from '../environments/environment'; // Import environment

         getRestaurants() {
         // this.http.get('http://host.docker.internal:4000/api/restaurants')  
         // this.http.get('http://localhost:4000/api/restaurants')
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
   ```


1. Check Dockerfile -->  use .dockerignore (to ignore node_modules and other unwanted files copying from local to docker image)

2. If we need to customize the nginx port, create a `nginx.conf` file. By default nginx will use port 80. Suppose you need to modify your nginx port then edit this file. In this application our index.html will be created inside `dist/browser/index.html`. So we need to modify the `nginx.conf` file. And need to mention the `index.html` path in this file.

   ```
   server {
    listen 80;
    server_name localhost;

    # Point root to /browser
    root /usr/share/nginx/html/browser;    #Here we mention the path where our index.html is created
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Add proper access control
    location ~* \.(js|css|html|ico|json|map)$ {
        add_header Access-Control-Allow-Origin *;
        try_files $uri =404;
    }
   }
   ```

2. now we are going to build the docker image. --> cd frontend


    ```
    docker build -t restaurant-frontend .      // Docker command to build the frontend docker image
    ```

3. Once the docker image for frontend is created. Now we are going to run the docker container from docker image. we can either use docker commands (or) docker compose yml file. 

    `Docker commands:`

    ``` 
    docker run -d --name frontend --network mean-stack-network -p 4200:80 restaurant-frontend:latest

    // [The above command will run frontend-container inside mean-stack-network with port number as nginx default port 80 and we can access by 4200 port from our localhost]

    docker stop {container name (or) ID}     // command to stop the docker container

    docker rm {container name (or) ID}      // command to remove the docker container

    docker rmi {Image name (or) ID}         // command to remove the docker Image

    ```

    The problem with docker commands is it is difficult to pass environment from docker commands. we can do that but it increases the size of the command instead we can use `docker-compose.yml` which is a best practice.

    So check `docker-compose.yml` instead of using the docker commands.


    ```
    docker-compose up -d   // This command will run the docker-compose file and start the container.

    docker-compose down    //  This command will stop the container.
    ```

### Checking:

1. Once the docker container is created. check `docker ps` to see that the container is created or not. 
2. Then run `docker logs {container name (or) ID}`  -->  To check the container logs.
3. Paste `http://localhost:4200` in browser.

### Note:

1. In angular we need to use environment.ts and environment.prod.ts  file. Angular doesn't provide runtime environment variables directly such as `process.env.MONGO_URL`.

2. `server.ts` for DNS and localhost:port.    -->  Just for your information.


   ```
      function run(): void {
   const port = process.env['PORT'] || 4000;

   // Start up the Node server
   const server = app();
   server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
   });
   }
   ```

3. We are using angular default port 4200 to access our frontend. To change the port we need to edit `angular.json` file. Also to change the dist path  we need to edit `angular.json` file.


## Note:

## Creating Kubernetes pods for the frontend application:

### Prerequisite for Testing:

1. make sure your docker-desktop application is running.
2. minikube start   -->  Run this command to start minikube cluster.
3. make sure to login docker in order to push the docker image to docker hub.
 
    `docker commands:`

    ```
    docker login        // login to dockerhub

    docker tag restaurant-backend:latest snaveenkpn/restaurant-backend:1    // tag your docker image in order to push the image to dockerhub

    docker push snaveenkpn/restaurant-backend:1     // push tagged docker image to docker hub

    ```

You can either use minikube cluster (or) Kind cluster.

3. minikube status
4. kubectl get nodes

### Note:

For kubernetes deployment it is good to use minikube for testing. But the real problem is we will face connection issue  between frontend and backend. Eventhough we pass the backend url correctly to frontend code it still will not connect. So to avoid this problem we need to create a ingress for frontend and backend and then in frontend code we pass the `backend ingress host along with path URL as a api url.` Now both frontend and backend will get connected.

## Steps to deploy our code in eks/aks cluster:

Before Deploying the frontend yaml, deploy the backend and mongo db yaml. Check `Backend Repo URL : https://github.com/snaveenkpndevops/MEAN_Stack_Restaurant_App_Backend`

1. Create a Eks Public Cluster.
2. Create a Node Group with spot instance inorder to reduce eks cost.
3. SG --> Allow All Traffic
4. Once Eks cluster and node group created.
5. Open VS CODE terminal  -->  Execute the below commands.

        * aws configure
        * aws eks update-kubeconfig --region ap-south-1 --name mean-stack-eks 
        * kubectl config current-context 
        * helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
        * helm repo update
        * helm repo add jetstack https://charts.jetstack.io
        * helm repo update
        * helm install ingress-nginx ingress-nginx/ingress-nginx  --create-namespace --namespace ingress-basic --version 4.5.2     
        * helm repo update
        * kubectl create ns restaurant

6. The Installation of ingress-nginx will create a `Classic Load balancer` in aws. Copy the load balancer DNS.
7. Create a `Ingress.yaml`  

   ```
   // ingress.yaml

   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
   name: ingress-todo
   namespace: restaurant
   annotations:
      nginx.ingress.kubernetes.io/enable-cors: "true"
      nginx.ingress.kubernetes.io/cors-allow-headers: "*"
      nginx.ingress.kubernetes.io/cors-allow-methods: "*"
      nginx.ingress.kubernetes.io/cors-allow-origin: "*"
      kubernetes.io/ingress.class: nginx
      #nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
   ingressClassName: nginx
   rules:
      - host: adf2479f8ccd345bab71a60579c127eb-1366346907.ap-south-1.elb.amazonaws.com
         http:
         paths:
            # Path for frontend
            - path: / # Matches all URLs starting with /
               pathType: Prefix
               backend:
               service:
                  name: frontend-service
                  port:
                     number: 4200
            
            # Path for backend
            - path: /api/restaurants # Matches all URLs starting with /api/restaurants
               pathType: Prefix
               backend:
               service:
                  name: backend-service
                  port:
                     number: 4000

   ```
8. Kubectl apply -f e:\MyHandsonProjects\CICD_Projects\test1\Kubernetes\ingress.yaml -n restaurant

9. In frontend `app.component.js` and `restaurant.service.ts` file we need to change the private apiUrl. Already we know that we have created `environment.ts` and `environment.prod.ts` file we need to just modify value of the `apiurl` variable.

   ```

      // /src/environment/environment.ts 

      export const environment = {
      production: false,
      //apiUrl: 'http://backend-service.restaurant.svc.cluster.local:4000/api/restaurants'
      //apiUrl: 'http://localhost:4000/api/restaurants'
      // Backend Ingress hostpath 
      apiUrl: 'http://adf2479f8ccd345bab71a60579c127eb-1366346907.ap-south-1.elb.amazonaws.com/api/restaurants'
      };

   ```


   ```

      // /src/environment/environment.ts.prod
      
      export const environment = {
      production: true,
      // Backend Ingress hostpath 
      apiUrl: 'http://adf2479f8ccd345bab71a60579c127eb-1366346907.ap-south-1.elb.amazonaws.com/api/restaurants'
      };

   ```

   ```

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

   ```

   ```
   //src/app/app.component.ts
   
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

   ```

10. docker build -t restaurant-frontend:1 .
11. docker tag restaurant-frontend:1 snaveenkpn/restaurant-frontend:1
12. docker push snaveenkpn/restaurant-frontend:1
13. kubectl apply -f e:\MyHandsonProjects\CICD_Projects\test1\Kubernetes\frontend.yaml -n restaurant

   ```
   // frontend.yaml

   apiVersion: apps/v1
   kind: Deployment
   metadata:
   name: frontend
   namespace: restaurant  # Specify the namespace if needed
   spec:
   replicas: 1  # Adjust based on your desired replica count
   selector:
      matchLabels:
         app: frontend
   template:
      metadata:
         labels:
         app: frontend
      spec:
         containers:
         - name: frontend
         image: snaveenkpn/restaurant-frontend:1 # Replace with your frontend image
         ports:
         - containerPort: 80  # Expose the frontend port

   ---
   apiVersion: v1
   kind: Service
   metadata:
   name: frontend-service
   namespace: restaurant  # Specify the namespace if needed
   spec:
   selector:
      app: frontend
   ports:
   - protocol: TCP
      port: 4200  # Port exposed for frontend access
      targetPort: 80  # Port inside the container
      #nodePort: 31000  # NodePort for external access
   type: ClusterIP  # Can be NodePort or ClusterIP or LoadBalancer depending on your needs

   ```

### Images:

![Frontend Logo](./images/Kubernetes%20Restaurant%20Frontend.png)

![Frontend Logo](./images/Kubernetes%20Restaurant%20Backend.png)