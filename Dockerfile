FROM node:8-alpine

FROM node:8-alpine

COPY package.json package-lock.json ./
RUN npm install
COPY ./ ./
# RUN npm run build
CMD ["npm", "run", "start"]