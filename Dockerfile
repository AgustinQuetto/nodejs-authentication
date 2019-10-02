FROM node:10.15-alpine
ENV NODE_ENV production
ENV PORT 5100
ENV REDISURL redis
ENV MONGODB_IP mongo-server
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm config set unsafe-perm true

RUN npm install --production --silent && mv node_modules ../
RUN npm install -g pm2 --silent
COPY . .
EXPOSE 5100
CMD ["pm2-runtime", "index.js"]