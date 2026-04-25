pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage('Repository checks') {
      steps {
        sh '''
          set -e
          echo "Checking repository structure..."
          test -f docker-compose.yml
          test -d backend
          test -d frontend
          test -d monitoring
          echo "Repository structure is valid."
        '''
      }
    }

    stage('Config checks') {
      steps {
        sh '''
          set -e
          echo "Checking required files..."
          test -f README.md
          test -f monitoring/prometheus.yml
          test -f frontend/nginx.conf
          test -f frontend/nginx-ssl.conf
          echo "Required files are present."
        '''
      }
    }
  }

  post {
    success {
      echo 'Jenkins pipeline completed successfully.'
    }
    failure {
      echo 'Jenkins pipeline failed. Check console output.'
    }
  }
}
