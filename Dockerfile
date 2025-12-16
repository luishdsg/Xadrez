FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run start

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0"]