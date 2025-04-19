# Build stage
FROM maven:3.9.5-amazoncorretto-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM amazoncorretto:21

WORKDIR /app

COPY --from=build /app/target/ems-1.0.0-RC1.jar /app/ems.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/ems.jar"]
