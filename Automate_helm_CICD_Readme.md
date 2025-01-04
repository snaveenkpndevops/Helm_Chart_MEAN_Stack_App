# Automate Helm Chart for MEAN Stack Restaurant App using Github Action:

This repository contains a Helm chart, along with the Workflows files, frontend and backend code, as well as README files for both.


## Reference:

To understand the basic workflow of a Helm chart on your local machine, please refer to the `README.md` file.


## Overview:

### Note: 

For this hands-on session, we will utilize a self-hosted runner in GitHub Actions.


### Github Action CI Workflow Steps:

1. Checkout the code
2. docker login, build, tag, push the image to dockerhub.
3. update the docker image tag in values.yaml and update the docker image tag in app version of chart.yaml in the helm chart.
4. If the update is minor or major change then update the chart version in chart.yaml in the helm chart. For small code changes, just update only the app version of chart.yaml in the helm chart.
5. package the helm chart.
6. update the chart details and version in index.yaml file.

[ Now in github the helm chart is updated ]


### Github Action CD Workflow Steps:

1. Connect to our minikube cluster (or) eks cluster.
2. Add the helm repository of our helm chart.
3. update the helm repository.
4. Install the helm chart for our application (frontend, backend, mongodb chart).
5. If the chart is already installed, then just upgrade the helm chart.


## Prerequisite:

### Our Self-hosted Runner is running in our local windows machine:

1. Open docker desktop in our local machine.
2. helm installation in our local machine.
3. make sure to login to docker
4. create a minikube cluster and start the minikube cluster.

```
// Open VSCODE Run the below command to start minikube:

minikube start     -->  This will create the minikube cluster

kubectl get nodes  --> This will show the nodes

kubectl config current-context  -->  This cmd will show the current cluster.

```

5. Kubectl installation in our local machine. And update kube-config context.

6. Run the Github-Action Runner in your local machine.

Please Read the `Runners_README.md` for hosting the Self-hosted runner in your local machine: `https://github.com/snaveenkpndevops/Github_Action_learning/blob/main/Runners_README.md`

