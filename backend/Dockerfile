FROM node:20-alpine
WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p data
EXPOSE 5000
CMD ["node", "index.js"]
