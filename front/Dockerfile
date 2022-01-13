FROM node:14.17-alpine as build

WORKDIR /app/front

COPY package*.json ./

RUN npm install

COPY . .

#CMD ["sh", "run.sh"]
RUN npm run build

FROM nginx
COPY --from=build /app/front/build /usr/share/nginx/html