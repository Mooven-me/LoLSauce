FROM node:18-alpine AS react_build

WORKDIR /app
COPY ./package*.json ./
RUN npm install

COPY . .

FROM react_build AS react_dev

CMD ["npm", "run", "dev", "--", "--host"]

FROM react_build AS react_prod

CMD ["npm", "run", "build-prod"]