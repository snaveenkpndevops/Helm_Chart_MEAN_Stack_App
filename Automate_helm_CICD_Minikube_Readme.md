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



## Frontend Github Action CI/CD Workflow Steps:

1. For Frontend Github Action CI/CD  manual trigger Workflow use the `self_hosted_CI_frontend_manual_trigger.yml` file.


```
// .github/workflows/self_hosted_CI_frontend_manual_trigger.yml

name: Helm CI/CD Automation for frontend manual_trigger

on:
  workflow_dispatch:   # This line makes the workflow run only when user's manual trigger (eliminates automatic trigger on push)    
    inputs:
      update_chart_version:
        description: 'Do you want to update the chart version? (yes/no)'
        required: true
        default: 'no'

env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  BUILD_ID: ${{ github.run_id }}
  FRONTEND_IMAGE: "snaveenkpn/restaurant-frontend"

jobs:
  build-and-deploy:
    runs-on: self-hosted           # Self-hosted runner tag

    steps:
    # Step 1: Checkout the code
    - name: Checkout code
      uses: actions/checkout@v3

    # Step 2: Docker login    #// We already login to dockerhub manually in our local machine. so skip this step
    - name: Docker Login
      run: |
        docker login -u ${{ env.DOCKER_USERNAME }} -p ${{ env.DOCKER_PASSWORD }}
      shell: powershell

    # Step 3: Build Docker image
    - name: Build Docker Image
      run: |
        docker build -t ${{ env.FRONTEND_IMAGE }}:${{ env.BUILD_ID }} -t ${{ env.FRONTEND_IMAGE }}:latest ./frontend
      shell: powershell  

    # Step 4: Push Docker image to DockerHub
    - name: Push Docker Image
      run: |
        docker push ${{ env.FRONTEND_IMAGE }}:${{ env.BUILD_ID }}   # Staging Environment: You may deploy a specific tagged version, e.g., frontend:12345.
        docker push ${{ env.FRONTEND_IMAGE }}:latest                 # Development or Testing Environment: Developers might prefer using frontend:latest for ease of testing the most recent image.
      shell: powershell  

    # Step 5: Update `values.yaml` and `Chart.yaml` with new image tag
    - name: Update Helm Chart Image Tag
      run: |
        (Get-Content ./helm/frontend-chart/values.yaml) -replace 'tag:.*', "tag: '${{ env.BUILD_ID }}'" | Set-Content ./helm/frontend-chart/values.yaml
        (Get-Content ./helm/frontend-chart/Chart.yaml) -replace 'appVersion:.*', "appVersion: '${{ env.BUILD_ID }}'" | Set-Content ./helm/frontend-chart/Chart.yaml
      shell: powershell

    # Step 6: Update Chart Version
    - name: Update Chart Version
      if: ${{ github.event.inputs.update_chart_version == 'yes' }}
      run: |
        $chart_yaml = Get-Content "./helm/frontend-chart/Chart.yaml"
        $current_version = ($chart_yaml | Select-String -Pattern "^version:" | ForEach-Object { $_.Line.Split(':')[1].Trim() })
        $major, $minor, $patch = $current_version -split '\.'

        # Increment the patch version
        $patch = [int]$patch + 1

        # If patch reaches 10, reset patch to 0 and increment minor version
        if ($patch -ge 10) {
            $patch = 0
            $minor = [int]$minor + 1
        }

        # If minor reaches 10, reset minor to 0 and increment major version
        if ($minor -ge 10) {
            $minor = 0
            $major = [int]$major + 1
        }

        # Construct the new version
        $new_version = "$major.$minor.$patch"

        # Update the Chart.yaml file
        $chart_yaml -replace "^version:.*", "version: $new_version" | Set-Content "./helm/frontend-chart/Chart.yaml"


    # Step 7: Lint Helm Chart
    - name: Lint Helm Chart
      run: |
        helm dep update ./helm/frontend-chart
        helm lint ./helm/frontend-chart
      shell: powershell

    # Step 8: Package Helm Chart
    - name: Package Helm Chart
      run: |
        helm package ./helm/frontend-chart -d ./helm/output
      shell: powershell

    # Step 9: Update Index.yaml
    - name: Update Helm Repo Index
      run: |
        $REPO_URL = "https://snaveenkpn.github.io/Helm_Chart_MEAN_Stack_App"
        if (!(Test-Path -Path ./helm/output/index.yaml)) {
          echo "index.yaml not found. Creating a new index.yaml file."
          helm repo index ./helm/output --url $REPO_URL
        }
        (Get-Content ./helm/output/index.yaml) -replace '\$BUILD_ID', '${{ env.BUILD_ID }}' | Set-Content ./helm/output/index.yaml
        helm repo index ./helm/output --url $REPO_URL
      shell: powershell


    # Step 10: create namespace and upgrade Helm chart (Deploy to Staging)
    - name: Deploy Frontend
      run: |
        # Check if the namespace exists and create it if not
        kubectl get namespace restaurant
        if ($?) {
          echo "Namespace exists"
        } else {
          kubectl create namespace restaurant
        }
        
        # Upgrade or install the Helm chart for frontend
        helm upgrade --install frontend ./helm/frontend-chart --namespace restaurant --set image.tag=${{ env.BUILD_ID }} --atomic
        
        # Wait for the frontend deployment to become available
        kubectl wait --for=condition=available --timeout=600s deployment/frontend -n restaurant
        
        # Get the pods in the restaurant namespace
        kubectl get pods -n restaurant
        
        # Check the rollout status of the frontend deployment
        kubectl rollout status deployment frontend -n restaurant
      shell: powershell


    # Step 11: Commit and Push Changes
    - name: Commit and Push Changes
      run: |
        git config user.name "${{ github.actor }}"
        git config user.email "${{ github.actor }}@users.noreply.github.com"
        git add .
        git status
        
        # Check for changes and commit them
        $diff = git status --porcelain
        if ($diff) {
          git commit -m "Updated Helm Chart: appVersion=${{ env.BUILD_ID }}"
          git push
        } else {
          Write-Host "No changes to commit"
        }
      shell: powershell


    # # Step 12: Send Notifications
    # - name: Notify Slack
    #   if: always()
    #   uses: slackapi/slack-github-action@v1.23.0
    #   with:
    #     payload: |
    #       {
    #         "text": "Helm CI/CD workflow for ${{ github.repository }} has completed with status: ${{ job.status }}."
    #       }
    #   env:
    #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}




```


2. For Frontend Github Action CI/CD  automatically trigger Workflow use the `self_hosted_CI_frontend_automate_trigger.yml` file. The below code will trigger the workflow for any updates in the frontend folder as well as you can also trigger it manually for other use cases. But when it is automatically triggered then it will only update the app version  in chart.yaml not update the chart version in chart.yaml. But in manual trigger based upon input we can update the chart version as well.


```
// .github/workflows/self_hosted_CI_frontend_automate_trigger.yml

name: Helm CI/CD Automation for frontend automatically_trigger

# There is disadvantage for this workflow, we can't update the chart version because it will consider no as default.

on:
  # Un comment the below 3 lines for automatic workflow trigger when there is any update in frontend folder.
  push:
    paths:
      - 'frontend/**'   # This will trigger the workflow for any updates in the frontend folder
  workflow_dispatch:   # This line keeps the manual trigger option for other use cases
    inputs:
      update_chart_version:
        description: 'Do you want to update the chart version? (yes/no)'
        required: true
        default: 'no'

env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  BUILD_ID: ${{ github.run_id }}
  FRONTEND_IMAGE: "snaveenkpn/restaurant-frontend"

jobs:
  build-and-deploy:
    runs-on: self-hosted           # Self-hosted runner tag

    steps:
    # Step 1: Checkout the code
    - name: Checkout code
      uses: actions/checkout@v3

    # Step 2: Docker login    #// We already login to dockerhub manually in our local machine. so skip this step
    - name: Docker Login
      run: |
        docker login -u ${{ env.DOCKER_USERNAME }} -p ${{ env.DOCKER_PASSWORD }}
      shell: powershell

    # Step 3: Build Docker image
    - name: Build Docker Image
      run: |
        docker build -t ${{ env.FRONTEND_IMAGE }}:${{ env.BUILD_ID }} -t ${{ env.FRONTEND_IMAGE }}:latest ./frontend
      shell: powershell  

    # Step 4: Push Docker image to DockerHub
    - name: Push Docker Image
      run: |
        docker push ${{ env.FRONTEND_IMAGE }}:${{ env.BUILD_ID }}   # Staging Environment: You may deploy a specific tagged version, e.g., frontend:12345.
        docker push ${{ env.FRONTEND_IMAGE }}:latest                 # Development or Testing Environment: Developers might prefer using frontend:latest for ease of testing the most recent image.
      shell: powershell  

    # Step 5: Update `values.yaml` and `Chart.yaml` with new image tag
    - name: Update Helm Chart Image Tag
      run: |
        (Get-Content ./helm/frontend-chart/values.yaml) -replace 'tag:.*', "tag: '${{ env.BUILD_ID }}'" | Set-Content ./helm/frontend-chart/values.yaml
        (Get-Content ./helm/frontend-chart/Chart.yaml) -replace 'appVersion:.*', "appVersion: '${{ env.BUILD_ID }}'" | Set-Content ./helm/frontend-chart/Chart.yaml
      shell: powershell

    # Step 6: Update Chart Version
    - name: Update Chart Version
      if: ${{ github.event.inputs.update_chart_version == 'yes' }}
      run: |
        $chart_yaml = Get-Content "./helm/frontend-chart/Chart.yaml"
        $current_version = ($chart_yaml | Select-String -Pattern "^version:" | ForEach-Object { $_.Line.Split(':')[1].Trim() })
        $major, $minor, $patch = $current_version -split '\.'

        # Increment the patch version
        $patch = [int]$patch + 1

        # If patch reaches 10, reset patch to 0 and increment minor version
        if ($patch -ge 10) {
            $patch = 0
            $minor = [int]$minor + 1
        }

        # If minor reaches 10, reset minor to 0 and increment major version
        if ($minor -ge 10) {
            $minor = 0
            $major = [int]$major + 1
        }

        # Construct the new version
        $new_version = "$major.$minor.$patch"

        # Update the Chart.yaml file
        $chart_yaml -replace "^version:.*", "version: $new_version" | Set-Content "./helm/frontend-chart/Chart.yaml"


    # Step 7: Lint Helm Chart
    - name: Lint Helm Chart
      run: |
        helm dep update ./helm/frontend-chart
        helm lint ./helm/frontend-chart
      shell: powershell

    # Step 8: Package Helm Chart
    - name: Package Helm Chart
      run: |
        helm package ./helm/frontend-chart -d ./helm/output
      shell: powershell

    # Step 9: Update Index.yaml
    - name: Update Helm Repo Index
      run: |
        $REPO_URL = "https://snaveenkpn.github.io/Helm_Chart_MEAN_Stack_App"
        if (!(Test-Path -Path ./helm/output/index.yaml)) {
          echo "index.yaml not found. Creating a new index.yaml file."
          helm repo index ./helm/output --url $REPO_URL
        }
        (Get-Content ./helm/output/index.yaml) -replace '\$BUILD_ID', '${{ env.BUILD_ID }}' | Set-Content ./helm/output/index.yaml
        helm repo index ./helm/output --url $REPO_URL
      shell: powershell


    # Step 10: create namespace and upgrade Helm chart (Deploy to Staging)
    - name: Deploy Frontend
      run: |
        # Check if the namespace exists and create it if not
        kubectl get namespace restaurant
        if ($?) {
          echo "Namespace exists"
        } else {
          kubectl create namespace restaurant
        }
        
        # Upgrade or install the Helm chart for frontend
        helm upgrade --install frontend ./helm/frontend-chart --namespace restaurant --set image.tag=${{ env.BUILD_ID }} --atomic
        
        # Wait for the frontend deployment to become available
        kubectl wait --for=condition=available --timeout=600s deployment/frontend -n restaurant
        
        # Get the pods in the restaurant namespace
        kubectl get pods -n restaurant
        
        # Check the rollout status of the frontend deployment
        kubectl rollout status deployment frontend -n restaurant
      shell: powershell


    # Step 11: Commit and Push Changes
    - name: Commit and Push Changes
      run: |
        git config user.name "${{ github.actor }}"
        git config user.email "${{ github.actor }}@users.noreply.github.com"
        git add .
        git status

        # Check for changes and commit them
        $diff = git status --porcelain
        if ($diff) {
          git commit -m "Updated Helm Chart: appVersion=${{ env.BUILD_ID }}"
          git push
        } else {
          Write-Host "No changes to commit"
        }
      shell: powershell



```


## Backend Github Action CI/CD Workflow Steps:

1. For Backend Github Action CI/CD  manual trigger Workflow use the `self_hosted_CI_Backend_manual_trigger.yml` file.


```
// .github/workflows/self_hosted_CI_Backend_manual_trigger.yml


name: Helm CI/CD Automation for backend manual_trigger

on:
  workflow_dispatch:   # This line makes the workflow run only when user's manual trigger (eliminates automatic trigger on push)    
    inputs:
      update_chart_version:
        description: 'Do you want to update the chart version? (yes/no)'
        required: true
        default: 'no'

env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  BUILD_ID: ${{ github.run_id }}
  BACKEND_IMAGE: "snaveenkpn/restaurant-backend"

jobs:
  build-and-deploy:
    runs-on: self-hosted           # Self-hosted runner tag

    steps:
    # Step 1: Checkout the code
    - name: Checkout code
      uses: actions/checkout@v3

    # Step 2: Docker login    #// We already login to dockerhub manually in our local machine. so skip this step
    - name: Docker Login
      run: |
        docker login -u ${{ env.DOCKER_USERNAME }} -p ${{ env.DOCKER_PASSWORD }}
      shell: powershell

    # Step 3: Build Docker image
    - name: Build Docker Image
      run: |
        docker build -t ${{ env.BACKEND_IMAGE }}:${{ env.BUILD_ID }} -t ${{ env.BACKEND_IMAGE }}:latest ./backend
      shell: powershell  

    # Step 4: Push Docker image to DockerHub
    - name: Push Docker Image
      run: |
        docker push ${{ env.BACKEND_IMAGE }}:${{ env.BUILD_ID }}   # Staging Environment: You may deploy a specific tagged version, e.g., backend:12345.
        docker push ${{ env.BACKEND_IMAGE }}:latest                 # Development or Testing Environment: Developers might prefer using backend:latest for ease of testing the most recent image.
      shell: powershell  

    # Step 5: Update `values.yaml` and `Chart.yaml` with new image tag
    - name: Update Helm Chart Image Tag
      run: |
        (Get-Content ./helm/backend-chart/values.yaml) -replace 'tag:.*', "tag: '${{ env.BUILD_ID }}'" | Set-Content ./helm/backend-chart/values.yaml
        (Get-Content ./helm/backend-chart/Chart.yaml) -replace 'appVersion:.*', "appVersion: '${{ env.BUILD_ID }}'" | Set-Content ./helm/backend-chart/Chart.yaml
      shell: powershell

    # Step 6: Update Chart Version
    - name: Update Chart Version
      if: ${{ github.event.inputs.update_chart_version == 'yes' }}
      run: |
        $chart_yaml = Get-Content "./helm/backend-chart/Chart.yaml"
        $current_version = ($chart_yaml | Select-String -Pattern "^version:" | ForEach-Object { ($_.Line -split ':')[1].Trim().Split(' ')[0] })
        $major, $minor, $patch = $current_version -split '\.'

        # Increment the patch version
        $patch = [int]$patch + 1

        # If patch reaches 10, reset patch to 0 and increment minor version
        if ($patch -ge 10) {
            $patch = 0
            $minor = [int]$minor + 1
        }

        # If minor reaches 10, reset minor to 0 and increment major version
        if ($minor -ge 10) {
            $minor = 0
            $major = [int]$major + 1
        }

        # Construct the new version
        $new_version = "$major.$minor.$patch"

        # Update the Chart.yaml file
        $chart_yaml -replace "^version:.*", "version: $new_version" | Set-Content "./helm/backend-chart/Chart.yaml"


    # Step 7: Lint Helm Chart
    - name: Lint Helm Chart
      run: |
        helm dep update ./helm/backend-chart
        helm lint ./helm/backend-chart
      shell: powershell

    # Step 8: Package Helm Chart
    - name: Package Helm Chart
      run: |
        helm package ./helm/backend-chart -d ./helm/output
      shell: powershell

    # Step 9: Update Index.yaml
    - name: Update Helm Repo Index
      run: |
        $REPO_URL = "https://snaveenkpn.github.io/Helm_Chart_MEAN_Stack_App"
        if (!(Test-Path -Path ./helm/output/index.yaml)) {
          echo "index.yaml not found. Creating a new index.yaml file."
          helm repo index ./helm/output --url $REPO_URL
        }
        (Get-Content ./helm/output/index.yaml) -replace '\$BUILD_ID', '${{ env.BUILD_ID }}' | Set-Content ./helm/output/index.yaml
        helm repo index ./helm/output --url $REPO_URL
      shell: powershell


    # Step 10: create namespace and upgrade Helm chart (Deploy to Staging)
    - name: Deploy backend
      run: |
        # Check if the namespace exists and create it if not
        kubectl get namespace restaurant
        if ($?) {
          echo "Namespace exists"
        } else {
          kubectl create namespace restaurant
        }
        
        # Upgrade or install the Helm chart for backend
        helm upgrade --install backend ./helm/backend-chart --namespace restaurant --set image.tag=${{ env.BUILD_ID }} --atomic
        
        # Wait for the backend deployment to become available
        kubectl wait --for=condition=available --timeout=600s deployment/backend -n restaurant
        
        # Get the pods in the restaurant namespace
        kubectl get pods -n restaurant
        
        # Check the rollout status of the backend deployment
        kubectl rollout status deployment backend -n restaurant
      shell: powershell


    # Step 11: Commit and Push Changes
    - name: Commit and Push Changes
      run: |
        git config user.name "${{ github.actor }}"
        git config user.email "${{ github.actor }}@users.noreply.github.com"
        git add .
        git status
        
        # Check for changes and commit them
        $diff = git status --porcelain
        if ($diff) {
          git commit -m "Updated Helm Chart: appVersion=${{ env.BUILD_ID }}"
          git push
        } else {
          Write-Host "No changes to commit"
        }
      shell: powershell


    # # Step 12: Send Notifications
    # - name: Notify Slack
    #   if: always()
    #   uses: slackapi/slack-github-action@v1.23.0
    #   with:
    #     payload: |
    #       {
    #         "text": "Helm CI/CD workflow for ${{ github.repository }} has completed with status: ${{ job.status }}."
    #       }
    #   env:
    #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

```

2. For Backend Github Action CI/CD  automatically trigger Workflow use the `self_hosted_CI_Backend_automate_trigger.yml` file. The below code will trigger the workflow for any updates in the Backend folder as well as you can also trigger it manually for other use cases. But when it is automatically triggered then it will only update the app version  in chart.yaml not update the chart version in chart.yaml. But in manual trigger based upon input we can update the chart version as well.


```
// .github/workflows/self_hosted_CI_Backend_automate_trigger.yml


name: Helm CI/CD Automation for backend automatically_trigger

on:
  # Un comment the below 3 lines for automatic workflow trigger when there is any update in backend folder.
  # push:
  #   paths:
  #     - 'backend/**'   # This will trigger the workflow for any updates in the backend folder
  workflow_dispatch:   # This line makes the workflow run only when user's manual trigger (eliminates automatic trigger on push)    
    inputs:
      update_chart_version:
        description: 'Do you want to update the chart version? (yes/no)'
        required: true
        default: 'no'

env:
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  BUILD_ID: ${{ github.run_id }}
  BACKEND_IMAGE: "snaveenkpn/restaurant-backend"

jobs:
  build-and-deploy:
    runs-on: self-hosted           # Self-hosted runner tag

    steps:
    # Step 1: Checkout the code
    - name: Checkout code
      uses: actions/checkout@v3

    # Step 2: Docker login    #// We already login to dockerhub manually in our local machine. so skip this step
    - name: Docker Login
      run: |
        docker login -u ${{ env.DOCKER_USERNAME }} -p ${{ env.DOCKER_PASSWORD }}
      shell: powershell

    # Step 3: Build Docker image
    - name: Build Docker Image
      run: |
        docker build -t ${{ env.BACKEND_IMAGE }}:${{ env.BUILD_ID }} -t ${{ env.BACKEND_IMAGE }}:latest ./backend
      shell: powershell  

    # Step 4: Push Docker image to DockerHub
    - name: Push Docker Image
      run: |
        docker push ${{ env.BACKEND_IMAGE }}:${{ env.BUILD_ID }}   # Staging Environment: You may deploy a specific tagged version, e.g., backend:12345.
        docker push ${{ env.BACKEND_IMAGE }}:latest                 # Development or Testing Environment: Developers might prefer using backend:latest for ease of testing the most recent image.
      shell: powershell  

    # Step 5: Update `values.yaml` and `Chart.yaml` with new image tag
    - name: Update Helm Chart Image Tag
      run: |
        (Get-Content ./helm/backend-chart/values.yaml) -replace 'tag:.*', "tag: '${{ env.BUILD_ID }}'" | Set-Content ./helm/backend-chart/values.yaml
        (Get-Content ./helm/backend-chart/Chart.yaml) -replace 'appVersion:.*', "appVersion: '${{ env.BUILD_ID }}'" | Set-Content ./helm/backend-chart/Chart.yaml
      shell: powershell

    # Step 6: Update Chart Version
    - name: Update Chart Version
      if: ${{ github.event.inputs.update_chart_version == 'yes' }}
      run: |
        $chart_yaml = Get-Content "./helm/backend-chart/Chart.yaml"
        $current_version = ($chart_yaml | Select-String -Pattern "^version:" | ForEach-Object { $_.Line.Split(':')[1].Trim() })
        $major, $minor, $patch = $current_version -split '\.'

        # Increment the patch version
        $patch = [int]$patch + 1

        # If patch reaches 10, reset patch to 0 and increment minor version
        if ($patch -ge 10) {
            $patch = 0
            $minor = [int]$minor + 1
        }

        # If minor reaches 10, reset minor to 0 and increment major version
        if ($minor -ge 10) {
            $minor = 0
            $major = [int]$major + 1
        }

        # Construct the new version
        $new_version = "$major.$minor.$patch"

        # Update the Chart.yaml file
        $chart_yaml -replace "^version:.*", "version: $new_version" | Set-Content "./helm/backend-chart/Chart.yaml"


    # Step 7: Lint Helm Chart
    - name: Lint Helm Chart
      run: |
        helm dep update ./helm/backend-chart
        helm lint ./helm/backend-chart
      shell: powershell

    # Step 8: Package Helm Chart
    - name: Package Helm Chart
      run: |
        helm package ./helm/backend-chart -d ./helm/output
      shell: powershell

    # Step 9: Update Index.yaml
    - name: Update Helm Repo Index
      run: |
        $REPO_URL = "https://snaveenkpn.github.io/Helm_Chart_MEAN_Stack_App"
        if (!(Test-Path -Path ./helm/output/index.yaml)) {
          echo "index.yaml not found. Creating a new index.yaml file."
          helm repo index ./helm/output --url $REPO_URL
        }
        (Get-Content ./helm/output/index.yaml) -replace '\$BUILD_ID', '${{ env.BUILD_ID }}' | Set-Content ./helm/output/index.yaml
        helm repo index ./helm/output --url $REPO_URL
      shell: powershell


    # Step 10: create namespace and upgrade Helm chart (Deploy to Staging)
    - name: Deploy backend
      run: |
        # Check if the namespace exists and create it if not
        kubectl get namespace restaurant
        if ($?) {
          echo "Namespace exists"
        } else {
          kubectl create namespace restaurant
        }
        
        # Upgrade or install the Helm chart for backend
        helm upgrade --install backend ./helm/backend-chart --namespace restaurant --set image.tag=${{ env.BUILD_ID }} --atomic
        
        # Wait for the backend deployment to become available
        kubectl wait --for=condition=available --timeout=600s deployment/backend -n restaurant
        
        # Get the pods in the restaurant namespace
        kubectl get pods -n restaurant
        
        # Check the rollout status of the backend deployment
        kubectl rollout status deployment backend -n restaurant
      shell: powershell


    # Step 11: Commit and Push Changes
    - name: Commit and Push Changes
      run: |
        git config user.name "${{ github.actor }}"
        git config user.email "${{ github.actor }}@users.noreply.github.com"
        git add .
        git status
        
        # Check for changes and commit them
        $diff = git status --porcelain
        if ($diff) {
          git commit -m "Updated Helm Chart: appVersion=${{ env.BUILD_ID }}"
          git push
        } else {
          Write-Host "No changes to commit"
        }
      shell: powershell


    # # Step 12: Send Notifications
    # - name: Notify Slack
    #   if: always()
    #   uses: slackapi/slack-github-action@v1.23.0
    #   with:
    #     payload: |
    #       {
    #         "text": "Helm CI/CD workflow for ${{ github.repository }} has completed with status: ${{ job.status }}."
    #       }
    #   env:
    #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

```



## Checking

1. Once the workflow is completed, please check your github action temporary work directory. In my case it is in `C:\actions-runner\_work\Helm_Chart_MEAN_Stack_App\Helm_Chart_MEAN_Stack_App` folder. In this folder we will have all temporary files related to our github action repository.
2. In the above mentioned folder, go to  `C:\actions-runner\_work\Helm_Chart_MEAN_Stack_App\Helm_Chart_MEAN_Stack_App\helm\output` and in this folder open the `index.yaml` and check whether the chart version and app version is updated or not.
3. Then go to `C:\actions-runner\_work\Helm_Chart_MEAN_Stack_App\Helm_Chart_MEAN_Stack_App\helm\frontend-chart` folder and check chart.yaml and values.yaml and ensure the changes in image tag, chart version and app version.
4. Then go to `C:\actions-runner\_work\Helm_Chart_MEAN_Stack_App\Helm_Chart_MEAN_Stack_App\helm\backend-chart` folder and check chart.yaml and values.yaml and ensure the changes in image tag, chart version and app version.
5. Once everything is fine, Check whether the helm chart is updated in github repository. Check chart.yaml, values.yaml, index.yaml is updated in github repo or not.


## Note:

For standard practice, 

1. Clean the chart periodically for every 3 days or 5 days in github repository. Store the old helm chart in s3 deep glacier or Azure storage cold storage for cost optimization.