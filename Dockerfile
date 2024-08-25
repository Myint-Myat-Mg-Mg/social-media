FROM node:latest

WORKDIR /node

COPY . .

RUN npm install
EXPOSE 8000

CMD ["node","index.js"]