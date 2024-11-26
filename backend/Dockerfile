# Use Node.js image
FROM node:18-alpine


# Set working directory
WORKDIR /app

# Install dependencies
RUN npm install -g npm@10.9.1
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]