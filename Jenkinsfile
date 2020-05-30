pipeline {
  agent {
    kubernetes {
      //cloud 'kubernetes'
      defaultContainer 'jnlp'
      label 'mb-service-3'
      yaml """
kind: Pod
metadata:
  name: docker
spec:
  containers:
  - name: docker
    image: docker:latest
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    env: 
      - name: DOCKER_HOST 
        value: tcp://localhost:2375
      - name: GIT_COMMIT
        value: ${env.GIT_COMMIT}
      - name: BUILD_NUMBER
        value: ${env.BUILD_NUMBER}
    volumeMounts:
      - name: aws-ecr-creds
        mountPath: /root/.aws/
  - name: dind-daemon 
    image: docker:1.12.6-dind 
    resources: 
        requests: 
            cpu: 20m 
            memory: 512Mi 
    securityContext: 
        privileged: true 
    volumeMounts: 
      - name: docker-graph-storage 
        mountPath: /var/lib/docker
  volumes:
    - name: aws-ecr-creds
      secret:
        secretName: aws-ecr-creds
    - name: docker-graph-storage 
      emptyDir: {}
"""
    }
  }
  stages {
    stage('Pull code from Git') {
      steps {
        git 'https://github.com/black-mirror-1/mb-service-3'
      }
      
    }
    stage('Build with docker') {
      steps {
        container(name: 'docker') {
          sh '''
          export DOCKER_API_VERSION=1.24
          docker run --rm -i -v ~/.aws:/root/.aws amazon/aws-cli ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 693885100167.dkr.ecr.us-east-2.amazonaws.com
          docker build -t master-builder/sample-service-3 .
          docker tag master-builder/sample-service-3:latest 693885100167.dkr.ecr.us-east-2.amazonaws.com/master-builder/sample-service-3:v${BUILD_NUMBER}
          '''
        }
      }
    }
    stage('push Image to ECR') {
      steps {
        container(name: 'docker') {
          sh '''
          export DOCKER_API_VERSION=1.24
          docker push 693885100167.dkr.ecr.us-east-2.amazonaws.com/master-builder/sample-service-3:v${BUILD_NUMBER}
          '''
        }
      }
    }
    stage('update Image tag on deploy repo'){
      steps {
        withCredentials([usernamePassword(credentialsId: 'jenkins-github', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
            sh """
            git clone https://github.com/black-mirror-1/mb-service-3-deploy.git
            git config --global user.email "you@example.com"
            git config --global user.name "${GIT_USERNAME}"
            cd mb-service-3-deploy
            sed -i "s/imageTag: .*/imageTag: v${BUILD_NUMBER}/g" values/dev.yaml
            git add pre-prod/deployment.yml
            git commit -m 'replacing image tag'
            git push https://${GIT_USERNAME}:${URLEncoder.encode(GIT_PASSWORD, "UTF-8")}@github.com/black-mirror-1/mb-service-3-deploy.git
            """
        }
      }
    }
  }
}