FROM node:14.17-alpine

WORKDIR /app/back

COPY package*.json ./

RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python

RUN apk --update add postgresql-client

COPY . .

CMD ["sh", "wait-for-postgress.sh", "postgress", "sh", "run.sh"]