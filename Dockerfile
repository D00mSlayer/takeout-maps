# FROM node:12-alpine
# RUN apk add --no-cache python2 g++ make
# WORKDIR /app
# COPY . .
# RUN npm install
# CMD ["ng", "serve"]
# EXPOSE 3000


FROM ubuntu:22.04 AS build
SHELL ["/bin/bash", "--login", "-c"]

RUN apt update --fix-missing
RUN apt install -y curl

RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.17.1

RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN mkdir /usr/app
RUN mkdir /usr/app/log

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
COPY . .
RUN npm install
RUN npm run build
RUN npm link @angular/cli

# CMD ["ng", "serve", "--host", "0.0.0.0"]
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/takeout-maps /usr/share/nginx/html
