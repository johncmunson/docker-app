# Reference: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# This is our starting point, the base image we will build on top of
FROM node:latest

# Use LABEL to add metadata to the built image as key/value pairs
LABEL "maintainer"="johncmunson91@gmail.com"

# Create app directory
# All following commands, such as COPY, will be in relation to this directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

# Bundle app source
COPY . .

# The app binds to port 3000 so use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "start" ]
