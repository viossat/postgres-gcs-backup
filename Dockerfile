FROM node:11-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN apk add --no-cache postgresql-client \
	&& yarn install --production

COPY . ./

ENTRYPOINT ["node", "index.js"]
