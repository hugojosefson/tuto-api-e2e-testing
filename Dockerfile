FROM node:16.8 AS base

# Dockerize is needed to sync containers' startup
ENV DOCKERIZE_VERSION "v0.6.1"
RUN curl -sLf "https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz" | tar -xzvC /usr/local/bin

WORKDIR ~/app
COPY package.json .
COPY yarn.lock .

FROM base AS dependencies

RUN yarn

FROM dependencies AS runtime

COPY . .
