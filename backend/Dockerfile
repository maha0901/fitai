FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY .env* ./

EXPOSE 5000

CMD ["node", "src/index.js"]
