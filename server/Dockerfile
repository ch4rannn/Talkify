FROM node:20-alpine

# Install build tools needed for native SQLite bindings
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
ENV PORT=8080

# Create volume mount point and uploads directory
RUN mkdir -p /app/data/uploads

EXPOSE 8080

CMD ["npm", "start"]
