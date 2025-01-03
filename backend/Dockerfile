# Stage 1: Build
FROM node:latest AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Final Image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app

# Expose port 4000
EXPOSE 4000 

# Command to run the application
CMD ["node", "index.js"]
