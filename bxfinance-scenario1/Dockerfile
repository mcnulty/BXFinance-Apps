# This Dockerfile is used for QA, staging, and prod images.
# The .env config file should be updated accordingly before running "docker build...".
# The Dev environment has its own DockerFile and Compose YAML file because we want 
# a React dev build that allows for hot code reloading and volume mounted source for
# development with VSCode Remote.
 
# build environment
FROM node:13.12.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build .env

# production environment
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx
COPY --from=build /app/build /usr/share/nginx/html/app
EXPOSE 5000
CMD ["nginx","-g","daemon off;"]