# Executable Jlink image Dockerfile

# # 1st stage, build the UI
# FROM node:15.10.0-stretch-slim as build-ui
# WORKDIR /app
# COPY ui/package*.json ./
# RUN npm install
# COPY ./ui/ .
# RUN npm run release

# RUN echo "UI app built"

# 1st stage, build the app
# FROM maven:3.6.3-jdk-11-slim as build-api
FROM helidon/jdk11-graalvm-maven:21.0.0 as build-api

WORKDIR /app

# Create a first layer to cache the "Maven World" in the local repository.
# Incremental docker builds will always resume after that, unless you update
# the pom
ADD api/pom.xml .
# RUN mvn package -Dmaven.test.skip -Declipselink.weave.skip
RUN mvn package -Pnative-image -Dnative.image.skip -Dmaven.test.skip -Declipselink.weave.skip

# Do the Maven build to create the custom Java Runtime Image
# Incremental docker builds will resume here when you change sources
ADD api/src src
ADD ui/dist/ng-starter-template/ api/src/main/resources/WEB/
# RUN mvn -Ddocker.build=true package -Pjlink-image -DskipTests
RUN mvn package -Pnative-image -Dnative.image.buildStatic -DskipTests
RUN echo "done!"

# 2nd stage, build the final image with the JRI built in the 1st stage

FROM scratch
WORKDIR /app
COPY --from=build-api /app/target/schedule-reports.jar .
ENTRYPOINT ["/app/schedule-reports"]
EXPOSE 8088


# docker run -ti --rm -v $PWD:/src helidon/jdk11-graalvm-maven:21.0.0 sh -c 'cd /src && mvn package -Pnative-image -Dnative.image.buildStatic -DskipTests' 