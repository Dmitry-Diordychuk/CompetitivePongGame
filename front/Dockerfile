FROM node:14.17-alpine

WORKDIR /app/front

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "run.sh"]