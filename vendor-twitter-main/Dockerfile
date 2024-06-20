FROM node:16.18.0

WORKDIR /usr/src/app

COPY package.json .

RUN npm install && npm install typescript -g

COPY . .

RUN tsc

CMD ["npm", "start"]

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s \   
    CMD curl -f http://localhost:80/ || exit 1