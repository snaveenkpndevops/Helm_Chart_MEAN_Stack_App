# Helm Chart for MEAN Stack Restaurant App

This repository contains a Helm chart, along with the frontend and backend code, as well as README files for both.


## Reference:

```

devopscube blog: https://devopscube.com/create-helm-chart/


[This blog provides comprehensive information about how Helm charts work. I referred to this blog to create a Helm chart for my application.]

```

## Prerequisite:

### For local testing:

1. We need frontend code, backend code, Kubernetes yaml.
2. Open docker desktop in our local machine.
3. helm installation in our local machine.
4. Kubectl installation in our local machine
5. make sure to login to docker
6. create a minikube cluster

```
// Open VSCODE Run the below command to start minikube:

minikube start     -->  This will create the minikube cluster

kubectl get nodes  --> This will show the nodes

kubectl config current-context  -->  This cmd will show the current cluster.

```



## Helm Hands on:

In this we will be creating separate helm chart for frontend, backend and database.


### Overall Folder Structure:

![Overall Folder Structure image](./images/Overall%20Folder%20Structure.png)


1. Create a new folder named `helm`. You can provide any name.
2. cd helm
3. helm create frontend-chart  -->  It creates a chart with the name frontend-chart with default files and folders we have to edit it based upon our requirements.
4. helm create backend-chart   -->  It creates a chart with the name backend-chart with default files and folders we have to edit it based upon our requirements.
5. helm create mongodb-chart   -->  It creates a chart with the name mongodb-chart with default files and folders we have to edit it based upon our requirements.



### Now we are going to edit mongodb helm chart


### Mongodb-chart Folder Structure:

![Mongodb-chart Folder Structure image](./images/Mongodb%20Chart%20Folder%20Structure.png)

1. Remove all files and folder from templates folder which is inside mongodb-chart folder.
2. Edit the `chart.yaml` and include all the details as below.

```
// helm/mongodb-chart/Chart.yaml

apiVersion: v2                      # v2 indicates helm version 3, v1 indicated previous helm version.
name: restaurant-mongodb-chart      # Name of this chart
description: A Helm chart for MEAN stack Restaurant Mongodb Application
type: application                   # Application chart is for deploying the app in Kubernetes. Library Chart is for reusable in other helm chart.
version: 0.1.0                      # This denotes the Chart version
appVersion: "1.0.0"                 # This denotes the version of our backend application
maintainers:
  - name: Naveen                    # Information about the owner of the chart
    email: snaveenkpn@gmail.com     # Optional: you can include an email address for the maintainer

```

3. Add all mongodb related kubernetes yaml files inside templates folder.
4. Now edit `values.yaml` file.


```
// helm/mongodb-chart/values.yaml

# Default values for mongodb-chart.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

replicaCount: 1

image:
  repository: mongo

spec:
  ports: 27017

service:
  type: ClusterIP
  port: 27017
  targetPort: 27017

```


5. Now Update the Values in `mongo_db.yaml`


```
// helm/mongodb-chart/templates/mongo_db.yaml


apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: restaurant
  labels:
    app: mongodb
spec:
  replicas: {{ .Values.replicaCount }}
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
        - containerPort: {{ .Values.spec.ports }}
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
    port: {{ .Values.service.port }}
    targetPort: {{ .Values.service.targetPort }}
  type: {{ .Values.service.type }}


```



6. You can add `NOTES.txt` (Optional) inside the templates folder. The `NOTES.txt` file is often used in Helm charts to provide additional information about the chart or deployment process. It is not mandatory, but it's a best practice to include helpful content for users who may deploy your Helm chart.


```
// helm/mongodb-chart/templates/NOTES.txt


############################################
# MongoDB Deployment Notes
############################################

Thank you for deploying MongoDB with the mongodb-chart!

Your MongoDB instance has been successfully deployed.

To access the MongoDB service, follow these steps:

1. **Connect to MongoDB Pod**
   Run the following command to get the pod name:
   
   ```bash
   kubectl get pods -n restaurant -l app=mongodb


```

### Checking the mongodb helm chart:

1. cd helm/mongodb-chart

2. helm lint .              -->   This command will make sure that our chart is valid and, all the indentations are fine.

3. helm template .          -->   To validate if the values are getting substituted in the templates, you can render the templated YAML files with the values using the following command. It will generate and display all the manifest files with the substituted values.


4. cd ..                    -->  Now you are in helm directory.

5. helm install --dry-run mongodb mongodb-chart   -->  We can also use --dry-run command to check. This will pretend to install the chart to the cluster and if there is some issue it will show the error.

[The above command will not deploy any pods in cluster, it will just generate output that contains the information about the yaml files that is going to be deployed (all the yaml files that is going to be deployed in cluster)]


6. Minikube is already running in our machine. So we just need to install the chart, it will deploy our backend application (microservice) in minikube cluster.

7. kubectl create namespace restaurant

8. helm install  mongodb mongodb-chart  →  If you are outside the helm chart. Run this command to install all the yaml in cluster.

[or]

helm install mongodb  /path/of/helmchart  →  If you are outside the helm chart. Run this command to install all the yaml in cluster.


![mongodb-chart installation image](./images/mongodb%20chart%20installation%20output.png)

9. kubectl get all -n restaurant  -->  It will show all the resources in restaurant namespace.



## Now we are going to edit backend helm chart


### Backend-chart Folder Structure:

![Backend-chart Folder Structure image](./images/Backend%20Chart%20Folder%20Structure.png)


1. Remove all files and folder from templates folder which is inside backend-chart folder.
2. Edit the `chart.yaml` and include all the details as below.

```
// helm/backend-chart/Chart.yaml

apiVersion: v2                      # v2 indicates helm version 3, v1 indicated previous helm version.
name: restaurant-backend-chart      # Name of this chart
description: A Helm chart for MEAN stack Restaurant Backend Application
type: application                   # Application chart is for deploying the app in Kubernetes. Library Chart is for reusable in other helm chart.
version: 0.1.0                      # This denotes the Chart version
appVersion: "1.0.0"                 # This denotes the version of our backend application
maintainers:
  - name: Naveen                    # Information about the owner of the chart
    email: snaveenkpn@gmail.com     # Optional: you can include an email address for the maintainer

```

3. Add all Backend related kubernetes yaml files inside templates folder.
4. Now edit `values.yaml` file.


```
// helm/backend-chart/values.yaml

# Default values for backend-chart.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

replicaCount: 1

image:
  repository: snaveenkpn/restaurant-backend
  tag: "1"

spec:
  ports: 4000

service:
  type: ClusterIP
  port: 4000
  targetPort: 4000

```


5. Now Update the Values in `backend.yaml`


```
// helm/backend-chart/templates/backend.yaml


apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: restaurant
spec:
  replicas: {{ .Values.replicaCount }}
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
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.spec.ports }}
          env:
            - name: MONGO_URL
              value: "mongodb://root:password@mongodb-service:27017/myrestaurant_db?authSource=admin"
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
      port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
  type: {{ .Values.service.type }}

```



6. You can add `NOTES.txt` (Optional) inside the templates folder. The `NOTES.txt` file is often used in Helm charts to provide additional information about the chart or deployment process. It is not mandatory, but it's a best practice to include helpful content for users who may deploy your Helm chart.


```
// helm/backend-chart/templates/NOTES.txt


===============================================================
Welcome to the Restaurant Backend Helm Chart
===============================================================

1. **Installation Complete:**
   The Restaurant Backend application has been successfully deployed. You can now access the service via the Kubernetes cluster.

2. **Accessing the Application:**
   - If the service type is `ClusterIP`, the application is only accessible from within the cluster.
   - If you need to access the application externally, consider changing the service type to `LoadBalancer` or `NodePort` in your values.yaml file.

3. **Backend URL:**
   The backend service is accessible through the `backend-service` service in the `restaurant` namespace. Use the following to connect:
   - Service URL: backend-service:4000

4. **MongoDB Connection:**
   The backend is configured to connect to MongoDB at the URL `mongodb://root:password@mongodb-service:27017/myrestaurant_db?authSource=admin`. Ensure that the MongoDB service is running and properly configured.

5. **Scaling the Backend:**
   You can scale the backend deployment by adjusting the `replicaCount` value in the `values.yaml` file. This will allow you to increase or decrease the number of backend instances.

6. **Next Steps:**
   - Configure your environment variables or secrets in `values.yaml` for more advanced setups.
   - Optionally, add ingress or monitoring tools to manage your backend's exposure and health checks.

===============================================================
Thank you for using the Restaurant Backend Helm Chart!
===============================================================

```

### Checking the backend helm chart:

1. cd helm/backend-chart

2. helm lint .              -->   This command will make sure that our chart is valid and, all the indentations are fine.

3. helm template .          -->   To validate if the values are getting substituted in the templates, you can render the templated YAML files with the values using the following command. It will generate and display all the manifest files with the substituted values.


4. cd ..                    -->  Now you are in helm directory.

5. helm install --dry-run backend backend-chart   -->  We can also use --dry-run command to check. This will pretend to install the chart to the cluster and if there is some issue it will show the error.

[The above command will not deploy any pods in cluster, it will just generate output that contains the information about the yaml files that is going to be deployed (all the yaml files that is going to be deployed in cluster)]


6. Minikube is already running in our machine. So we just need to install the chart, it will deploy our backend application (microservice) in minikube cluster.

7. kubectl create namespace restaurant

8. helm install backend backend-chart  →  If you are outside the helm chart. Run this command to install all the yaml in cluster.

[or]

helm install backend  /path/of/helmchart  →  If you are outside the helm chart. Run this command to install all the yaml in cluster.


![backend-chart installation image](./images/backend%20chart%20installation%20output.png)


9. kubectl get all -n restaurant

![backend-chart installation image](./images/backend%20chart%20installation%20output%20kubectl%20result.png)


10. minikube service backend-service -n restaurant --url   -->  we can port-forward the backend service. Now paste the url in browser along with `/api/restaurants` (or) `/health`.


![Minikube Backend Service port-forward image](./images/minikube%20backend%20service%20port-forward.png)


![Minikube Backend Service port-forward image](./images/Backend%20Browser%20Result%20Minikube.png)


![Minikube Backend Service port-forward image](./images/Backend%20Browser%20Result%20Minikube1.png)




## Now we are going to edit Frontend helm chart


### Frontend-chart Folder Structure:

![Frontend-chart Folder Structure image](./images/Frontend%20Chart%20Folder%20Structure.png)


1. Remove all files and folder from templates folder which is inside frontend-chart folder.
2. Edit the `chart.yaml` and include all the details as below.

```
// helm/frontend-chart/Chart.yaml

apiVersion: v2                      # v2 indicates helm version 3, v1 indicated previous helm version.
name: restaurant-frontend-chart      # Name of this chart
description: A Helm chart for MEAN stack Restaurant frontend Application
type: application                   # Application chart is for deploying the app in Kubernetes. Library Chart is for reusable in other helm chart.
version: 0.1.0                      # This denotes the Chart version
appVersion: "1.0.0"                 # This denotes the version of our frontend application
maintainers:
  - name: Naveen                    # Information about the owner of the chart
    email: snaveenkpn@gmail.com     # Optional: you can include an email address for the maintainer

```

3. Add all frontend related kubernetes yaml files inside templates folder.
4. Now edit `values.yaml` file.


```
// helm/frontend-chart/values.yaml

# Default values for frontend-chart.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

replicaCount: 1

image:
  repository: snaveenkpn/restaurant-frontend
  tag: "1"

spec:
  ports: 80

service:
  type: ClusterIP
  port: 4200
  targetPort: 80



```


5. Now Update the Values in `frontend.yaml`


```
// helm/frontend-chart/templates/frontend.yaml


apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: restaurant
spec:
  replicas: {{ .Values.replicaCount }}
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
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.spec.ports }}

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: restaurant
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: {{ .Values.service.port }}
    targetPort: {{ .Values.service.targetPort }}
  type: {{ .Values.service.type }}


```



6. You can add `NOTES.txt` (Optional) inside the templates folder. The `NOTES.txt` file is often used in Helm charts to provide additional information about the chart or deployment process. It is not mandatory, but it's a best practice to include helpful content for users who may deploy your Helm chart.


```
// helm/frontend-chart/templates/NOTES.txt


###########################################
#         Frontend Chart Notes            #
###########################################

Thank you for deploying the Frontend component of the MEAN Stack Restaurant App!

The following details will help you access and manage your deployment:

------------------------------------------------------------
Deployment Details:
------------------------------------------------------------
- Deployment Name: frontend
- Namespace: restaurant
- Replica Count: {{ .Values.replicaCount }}
- Image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
- Container Port: {{ .Values.spec.ports }}

------------------------------------------------------------
Service Details:
------------------------------------------------------------
- Service Name: frontend-service
- Type: {{ .Values.service.type }}
- Port: {{ .Values.service.port }}
- Target Port: {{ .Values.service.targetPort }}

------------------------------------------------------------
Accessing the Frontend:
------------------------------------------------------------
- If the service type is **ClusterIP**:
  The frontend service is accessible only within the cluster.

- If the service type is **NodePort**:
  The frontend service can be accessed on any cluster node's IP at a port in the range 30000-32767.

- If the service type is **LoadBalancer**:
  Check the external IP assigned by your cloud provider. 
  You can monitor the service status using the following command:
  
  ```bash
  kubectl get svc frontend-service -n restaurant

```

### Checking the frontend helm chart:

1. cd helm/frontend-chart

2. helm lint .              -->   This command will make sure that our chart is valid and, all the indentations are fine.

3. helm template .          -->   To validate if the values are getting substituted in the templates, you can render the templated YAML files with the values using the following command. It will generate and display all the manifest files with the substituted values.


4. cd ..                    -->  Now you are in helm directory.

5. helm install --dry-run frontend frontend-chart   -->  We can also use --dry-run command to check. This will pretend to install the chart to the cluster and if there is some issue it will show the error.

[The above command will not deploy any pods in cluster, it will just generate output that contains the information about the yaml files that is going to be deployed (all the yaml files that is going to be deployed in cluster)]


6. Minikube is already running in our machine. So we just need to install the chart, it will deploy our frontend application (microservice) in minikube cluster.

7. kubectl create namespace restaurant

8. helm install frontend frontend-chart  →  If you are outside the helm chart. Run this command to install all the yaml in cluster.

[or]

helm install frontend  /path/of/helmchart  →  If you are outside the helm chart. Run this command to install all the yaml in cluster.


![frontend-chart installation image](./images/Frontend%20Chart%20Installation.png)


9. kubectl get all -n restaurant

![frontend-chart installation image](./images/Frontend%20Chart%20Installation1.png)


10. minikube service frontend-service -n restaurant --url   -->  we can port-forward the frontend service. Now paste the url in browser.


![Minikube frontend Service port-forward image](./images/minikube%20frontend%20service%20port-forward.png)


![Minikube frontend Service port-forward image](./images/Frontend%20app%20Checking.png)






## Note:

### Helm Upgrade & Rollback:

Now suppose you want to modify the chart (updated the image, replicas) and install the updated version, we can use the below command:

![helm upgrade backend backend-chart image](./images/backend-chart%20before%20upgrade.png)


![helm upgrade backend backend-chart image](./images/backend-chart%20before%20upgrade1.png)


![helm upgrade backend backend-chart image](./images/backend-chart%20after%20upgrade.png)




helm upgrade backend backend-chart 




![helm upgrade backend backend-chart image](./images/backend-chart%20after%20upgrade1.png)


![helm upgrade backend backend-chart image](./images/backend-chart%20after%20upgrade2.png)



helm rollback backend 3


kubectl get all -n restaurant


![helm upgrade backend backend-chart image](./images/backend-chart%20after%20upgrade3.png)