FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 6000

RUN mkdir "/arta_PV_dir"

CMD ["node", "container1.js"]
