FROM node:18-bullseye as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application (use the environment variables from docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Start new stage for production
FROM node:18-bullseye

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start the application and bind to all network interfaces
# Start the application
CMD ["serve", "-s", "dist", "-l", "3000", "--cors"]
