FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY pages ./pages
COPY components ./components
COPY lib ./lib
COPY styles ./styles
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
