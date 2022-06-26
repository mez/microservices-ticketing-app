FROM node:alpine

WORKDIR /app

COPY package.json .
RUN yarn install --prod
COPY . .


CMD [ "yarn", "start" ]