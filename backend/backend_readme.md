## Backend (Node.js + Express)

FYI: 

  ```
  Frontend Repo URL : https://github.com/snaveenkpndevops/MEAN_Stack_Restaurant_App_Frontend
  ```

Reference from geeks for geeks : https://www.geeksforgeeks.org/restaurant-recommendation-app-using-mean/

MEAN STACK  --> Mongo Express Angular Node.js

## Installation of node js packages and and code (Also Running the application in Local machine)

1. mkdir backend
2. cd backend

3. npm init -y  --> [To Initialize a new node.js project]

   * This will install `package.json` file

4. npm install body-parser cores cors dotenv express mongoose --save     --> This will install 6 npm packages (Node.js modules) into your project:

    [ This will create `package-lock.json` and `node_modules` file]

    [ Also This command will update dependencies in `package.json` file. In `package.json` file in dependency field you can see mongoose, express, dotenv dependency along with version.]

    * express --> A web framework for building RESTful APIs or web applications in Node.js. Simplifies server-side logic and routing.

    * mongoose --> An Object Data Modeling (ODM) library for MongoDB and Node.js. Simplifies interaction with MongoDB by providing schema and query-building functionalities.

    what is express? purpose?

    * It is a lightweigt framework, that simplifies the process of creating web application and APIs.
    * Express simplifies request routing, making it easy to define endpoints for different HTTP method (GET, POST, PUT, DELETE etc.)


5. Now we paste the backend code from Geeks for Geeks.

    1. backend/controller/restaurent.controller.js:
    
        * Its job is to receive a request from the user, process the filters they provide (like location, rating, or cuisines), and then find matching restaurants in a database.

        Example:

            Imagine a restaurant app like Zomato or Swiggy. When you apply filters like:

            Location: Chennai
            Rating: 4 stars or above
            Cuisine: Indian and Chinese

            This function will search the database for restaurants that match your filters and send the results back to you.


    2. backend/models/restaurant.model.js

        * It's a Mongoose schema for a "restaurant". A schema acts like a blueprint, telling the database what a "restaurant" record should look like and what kind of data it should store.

        What’s a Schema?

            1. Think of it like a form you fill out when adding a restaurant to the system. It specifies what information a restaurant should have (e.g., name, address, contact info, etc.).

            2. The line module.exports = mongoose.model("restaurant", restaurantSchema); creates a model named "restaurant". A model is like a toolkit that lets you perform database operations (like adding, searching, or updating restaurants).

        Example:

            If you're building an app like Zomato or Swiggy:

                * This schema is what defines how restaurant data is stored in the database.
                * It ensures consistency so that every restaurant has the same type of information, making it easier to manage and query.

    
    3. backend/routes/restaurant.route.js


        Purpose: This route is like the "search bar" for your restaurant app. When someone searches for restaurants by specifying criteria like "location" or "rating," this route processes the search.

        Example in Real Life:

            * A user opens the app and searches for "restaurants in Chennai with a rating of 4 or more."
            * The app sends a POST request to /restaurants with the search filters.
           
                {
                    "location": "Chennai",
                    "rating": 4
                }

            * This route picks up the request and calls the getRestaurantsByFilters function to look for restaurants in the database that match the filters.
            * The filtered results (or a "No results found" message) are sent back to the user.

    4. backend/index.js

        * This code sets up a basic backend for a restaurant application.

        * It connects to a MongoDB database, fills it with sample restaurant data, and provides two routes:
            
            ```
            `/health` to check if the server is running.
            `/api/restaurants` to get the list of restaurants.
            ```


6. node index.js    -->  To start the server run the following command.

   Note:

    * Replace the mongo db url in index.js


7. backend is listening to port http://localhost:4000/api/restaurants and http://localhost:4000/health

8. Note:

        while building the docker Image --> please ensure that in index.js update the mongodb URL 

        * Currently we are using our mongodb in local machine. so i update the mongourl as "mongodb://host.docker.internal:27017/Restaurant_db" in index.js file.
        * If we use mongo as docker container then we need to change the mongourl based on that.

9. Instead of hardcoding the port and Ip address in backend we are getting those info from env variable from kubernetes cluster.

    * In backend `index.js` file we modify this file

            ```
            const PORT = process.env.PORT || 4000;
            const HOST = process.env.HOST || '127.0.0.1'; // Fallback to localhost for local development

            app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT}`);
            });
            ```
    
    * Also in `mongo url` in `index.js` we modify the hardcoded lines

            ```
             //   process.env.MONGO_URL || local mongo db;              

            const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Restaurant_db";   

            [or]

            //   process.env.MONGO_URL || docker mongo db container; 

            const MONGO_URL = process.env.MONGO_URL || "mongodb://host.docker.internal:27017/Restaurant_db"   

            ```

## Note:

## Dockerize the backend application:

### Prerequisite:

    * make sure your docker-desktop application is running.

    * In `index.js` for dockerize application 

    ```
    const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/myrestaurant_db";

    // The process.env.MONGO_URL this value will be passed from docker-compose.yml file as a environmental variables.

    const PORT = process.env.PORT || 4000;

    // The process.env.PORT this value will be passed from docker-compose.yml file as a environmental variables.

    ```


1. Check Dockerfile -->  use .dockerignore (to ignore node_modules and other unwanted files copying from local to docker image)

2. now we are going to build the docker image. --> cd backend

    ```

    docker build -t restaurant-backend .      // Docker command to build the backend docker image

    ```
3. Once the docker image for backend is created. Now we are going to run the docker container from docker image. we can either use docker commands (or) docker compose yml file. 

    `Docker commands:`

    ```
    docker run -d  --name mongodb-container --network mean-stack-network  -p 27017:27017  -e MONGO_INITDB_ROOT_USERNAME=root  -e MONGO_INITDB_ROOT_PASSWORD=password  mongo

    // [The above command will run mongodb-container inside mean-stack-network with username as root and passowrd as password in 27017 port]
        
    docker run -d --name backend --network mean-stack-network -p 4000:4000 restaurant-backend:latest

    // [The above command will run backend-container inside mean-stack-network with port number as 4000]

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
3. Paste `http://localhost:4000/api/restaurants` (or) `http://localhost:4000/health`

### Note:

1. .env file is helpful for local development and testing.
2. For docker and kubernetes we will not use use .env file. we can directly pass the environment variable from yaml files. In our backend `index.js` file we will use `process.env.VARIABLE_NAME`



## Note:

## Creating Kubernetes pods for the backend application:

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

5. In backend `index.js` file change the mongo url.

    ```
    // For Kubernetes service use this
    const MONGO_URL = process.env.MONGO_URL || "mongodb://root:password@mongodb-service:27017/restaurant_db";  

    // For Kubernetes service use this (If mongodb namespace is different)
    //const MONGO_URL = process.env.MONGO_URL || "mongodb://root:password@mongodb-service.mongodb-namespace.svc.cluster.local:27017/restaurant_db"; 
    ```

6. Create kubernetes yaml for `mongo-db` and `backend` to be created in `restaurant` namespace. we are passing `MongoURL` from `backend.yaml` file.

    ```
    \\ mongo_db.yaml

    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: mongodb
    namespace: restaurant
    labels:
        app: mongodb
    spec:
    replicas: 1
    selector:
        matchLabels:
        app: mongodb
    template:
        metadata:
        labels:
            app: mongodb
        spec:
        containers:
        - name: mongodb
            image: mongo
            ports:
            - containerPort: 27017
            env:
            - name: MONGO_INITDB_ROOT_USERNAME
            value: root
            - name: MONGO_INITDB_ROOT_PASSWORD
            value: password
    ---
    apiVersion: v1
    kind: Service
    metadata:
    name: mongodb-service
    namespace: restaurant
    spec:
    selector:
        app: mongodb
    ports:
    - protocol: TCP
        port: 27017
        targetPort: 27017
    type: ClusterIP

    ```


    ```
    \\ backend.yaml

    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: backend
    namespace: restaurant
    spec:
    replicas: 1
    selector:
        matchLabels:
        app: backend
    template:
        metadata:
        labels:
            app: backend
        spec:
        containers:
        - name: backend
            image: snaveenkpn/restaurant-backend:1
            ports:
            - containerPort: 4000
            env:
            - name: MONGO_URL
            value: mongodb://root:password@mongodb-service:27017/restaurant_db?authSource=admin
    ---
    apiVersion: v1
    kind: Service
    metadata:
    name: backend-service
    namespace: restaurant
    spec:
    selector:
        app: backend
    ports:
    - protocol: TCP
        port: 4000
        targetPort: 4000
    type: NodePort  #ClusterIP

    ```

7. For testing purpose we configured the backend service type as `NodePort`. Once we test that backend and mongodb is working as expected then change the backend service type as `ClusterIP`.

### Checking the Kubernetes backend and MongoDB pods and services.

1. kubectl create ns restaurant
2. kubectl apply -f mongo_db.yaml
3. kubectl get pods -n restaurant  -->  Check mongodb pod is running or not.
4. kubectl apply -f backend.yaml
5. kubectl get pods -n restaurant  -->  Check backend pod is running or not.
6. kubectl logs backend-6bb64c8b6-jrk2n -n restaurant

   ```
    kubectl logs backend-6bb64c8b6-jrk2n -n restaurant
    Connected to MongoDB
    Server is running on port 4000
    Restaurant data seeded successfully!

   ```

7. minikube service backend-service -n restaurant --url   -->  This will show the minikube url and port. Paste that in browser

    ```
    minikube service backend-service -n restaurant --url
    W1121 23:08:41.847561   14352 main.go:291] Unable to resolve the current Docker CLI context "default": context "default": context not found: open C:\Users\Naveen\.docker\contexts\meta\37a8eec1ce19687d132fe29051dca629d164e2c4958ba141d5f4133a33f0688f\meta.json: The system cannot find the path specified.
    http://127.0.0.1:58819
    ❗  Because you are using a Docker driver on windows, the terminal needs to be open to run it.

    ```

8. Paste `http://127.0.0.1:58819/api/restaurants` (or)  `http://127.0.0.1:58819/health`  in browser.

9. Now If everything works fine then change the backend kubernetes service type to `ClusterIP`.


### Images:

![Backend Logo](./images/backend-minikube-check1.png)

![Backend Logo](./images/Screenshot_1backend-minikube-check2.png)


### Note:

For kubernetes deployment it is good to use minikube for testing. But the real problem is we will face connection issue  between frontend and backend. Eventhough we pass the backend url correctly to frontend code it still will not connect. So to avoid this problem we need to create a ingress for frontend and backend and then in frontend code we pass the `backend ingress host along with path URL as a api url.` Now both frontend and backend will get connected.

## Steps to deploy our code in eks/aks cluster:

1. Create a Eks Public Cluster.
2. Create a Node Group with spot instance inorder to reduce eks cost.
3. SG --> Allow All Traffic
4. Once Eks cluster and node group created.
5. Open VS CODE terminal  -->  Execute the below commands.

    ```

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
        * kubectl apply -f e:\MyHandsonProjects\CICD_Projects\test1\Kubernetes\mongo_db.yaml -n restaurant

    ```

    ```
        \\ Mongo_db.yaml

        apiVersion: apps/v1
        kind: Deployment
        metadata:
        name: mongodb
        namespace: restaurant
        labels:
            app: mongodb
        spec:
        replicas: 1
        selector:
            matchLabels:
            app: mongodb
        template:
            metadata:
            labels:
                app: mongodb
            spec:
            containers:
            - name: mongodb
                image: mongo
                ports:
                - containerPort: 27017
                env:
                - name: MONGO_INITDB_ROOT_USERNAME
                value: root
                - name: MONGO_INITDB_ROOT_PASSWORD
                value: password
        ---
        apiVersion: v1
        kind: Service
        metadata:
        name: mongodb-service
        namespace: restaurant
        spec:
        selector:
            app: mongodb
        ports:
        - protocol: TCP
            port: 27017
            targetPort: 27017
        type: ClusterIP

    ```

        * kubectl apply -f e:\MyHandsonProjects\CICD_Projects\test1\Kubernetes\backend.yaml -n restaurant

    ```
        \\ backend.yaml

        apiVersion: apps/v1
        kind: Deployment
        metadata:
        name: backend
        namespace: restaurant
        spec:
        replicas: 1
        selector:
            matchLabels:
            app: backend
        template:
            metadata:
            labels:
                app: backend
            spec:
            containers:
            - name: backend
                image: snaveenkpn/restaurant-backend:1
                ports:
                - containerPort: 4000
                env:
                - name: MONGO_URL
                value: mongodb://root:password@mongodb-service:27017/myrestaurant_db?authSource=admin
        ---
        apiVersion: v1
        kind: Service
        metadata:
        name: backend-service
        namespace: restaurant
        spec:
        selector:
            app: backend
        ports:
        - protocol: TCP
            port: 4000
            targetPort: 4000
        type: ClusterIP


    ```

6. FYR: `index.js` backend file. 

    ```
    //index.js

    app.use(express.json());
    app.use(cors());

    // For Docker Container use this
    //const MONGO_URL = process.env.MONGO_URL || "mongodb://root:password@mongodb-container:27017/restaurant_db?authSource=admin";  

    // For Kubernetes service use this
    const MONGO_URL = process.env.MONGO_URL || "mongodb://root:password@mongodb-service:27017/restaurant_db";  

    // For Kubernetes service use this (If mongodb namespace is different)
    //const MONGO_URL = process.env.MONGO_URL || "mongodb://root:password@mongodb-service.mongodb-namespace.svc.cluster.local:27017/restaurant_db"; 

    .
    .
    .
    .
    .
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    ```

7. Backend deployment is almost done. Now we need to create frontend and ingress. Then in ingress we need to create a routing for backend service. Check frontend Readme.md for further process.  `Frontend Repo URL : https://github.com/snaveenkpndevops/MEAN_Stack_Restaurant_App_Frontend`
