pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                bat 'git --version'
            }
        }

        stage('Backend Build and Tests') {
            steps {
                bat 'call backend\\mvnw.cmd -B -f backend\\pom.xml verify'
            }
        }

        stage('Frontend Lint and Build') {
            steps {
                dir('frontend') {
                    bat 'node --version'
                    bat 'npm --version'
                    bat 'npm ci'
                    bat 'npm run lint'
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        always {
            junit(
                testResults: 'backend/target/surefire-reports/TEST-*.xml',
                allowEmptyResults: true
            )

            archiveArtifacts(
                artifacts: 'backend/target/*.jar,frontend/dist/**',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }

        success {
            echo 'NeuroForge Nexus Jenkins CI passed.'
        }

        failure {
            echo 'Jenkins CI failed. Check the Console Output.'
        }
    }
}