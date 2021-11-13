FROM public.ecr.aws/bitnami/node:latest

COPY package*.json ./
RUN apt update && apt-get install -y build-essential
RUN npm install --unsafe-perm

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
