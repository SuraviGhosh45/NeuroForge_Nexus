FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN for attempt in 1 2 3; do \
      echo "Maven build attempt ${attempt}/3"; \
      if mvn -U -B -DskipTests package; then \
        exit 0; \
      fi; \
      if [ "$attempt" -lt 3 ]; then \
        delay=$((attempt * 15)); \
        echo "Maven failed; retrying in ${delay}s..."; \
        sleep "$delay"; \
      fi; \
    done; \
    echo "Maven build failed after 3 attempts"; \
    exit 1

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
