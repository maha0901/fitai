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

    stage('Compose validation') {
      steps {
        sh '''
          set -e
          echo "Validating docker compose configuration..."
          if command -v docker >/dev/null 2>&1; then
            docker compose config -q
            echo "docker-compose.yml is valid."
          else
            echo "Docker CLI is not available in this Jenkins agent. Skipping compose validation."
          fi
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
