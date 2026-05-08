FROM node:20-alpine AS react_build

WORKDIR /app
COPY ./package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
