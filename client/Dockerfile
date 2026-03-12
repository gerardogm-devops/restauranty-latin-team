FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG REACT_APP_SERVER_AUTH_URL="http://auth.gerardo.azure.diogohack.shop"
ARG REACT_APP_SERVER_DISCOUNTS_URL="http://discounts.gerardo.azure.diogohack.shop"
ARG REACT_APP_SERVER_ITEMS_URL="http://items.gerardo.azure.diogohack.shop"
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
