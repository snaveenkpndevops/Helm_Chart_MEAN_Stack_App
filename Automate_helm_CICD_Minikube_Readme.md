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
5. helm lint .  -->  This command will make sure that our chart is valid and, all the indentations are fine.
6. package the helm chart.
7. If the index.yaml is already exist then Update the application version in index.yaml if not then Create index.yaml and then Update the application version.

[ Now in github actions temporary work directory the helm chart is updated ]


### Github Action CD Workflow Steps:

So here we are going to deploy our helm chart in minikube cluster. Make Sure to start the minikube cluster as prerequisite and also ensure kubectl, helm is installed in your local machine and docker desktop should be open.

1. Connect to our minikube cluster.
2. Check whether restaurant namespace is exist or not. If not create it.
3. upgrade the helm chart in cluster, check whether the microservice is running or not. If not then rollback to previous version (This is achieved by `--atomic flag`)
4. Commit and push to github repository.  [So now we verified that helm is working as excepted, so we will push the helm chart and other files from github actions temporary workspace to github repository.]
5. Send email notification.


## Prerequisite:

### Our Self-hosted Runner is running in our local windows machine:

1. docker desktop should be open in our local machine.
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

