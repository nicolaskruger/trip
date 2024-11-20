# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application
COPY . .

# Expose the default Next.js port
EXPOSE 3000

# Run the development server
CMD ["yarn", "start:dev"]