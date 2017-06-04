FROM node:latest

WORKDIR /srv

COPY package.json .

RUN npm i --regsitry=https://regsitry.npm.taobao.org

COPY . .

RUN npm run build

CMD ["npm", "start"]
