FROM node:14.17-alpine

WORKDIR /app/back

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:linux"]