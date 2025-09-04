# Stage 1: Build the Vite app
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with a lightweight Node.js static server
FROM node:22-alpine

# Install a simple static server (serve)
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist /app/dist

# Set working directory
WORKDIR /app

# Expose port (default for serve is 5000, but we can map to 80)
EXPOSE 80

# Run the server (use -s for SPA mode to handle client-side routing)
CMD ["serve", "-s", "dist", "-l", "80"]