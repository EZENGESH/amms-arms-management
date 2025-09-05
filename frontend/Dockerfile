FROM node:18
WORKDIR /app


COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "npm run dev & while true; do sleep 1000; done"]