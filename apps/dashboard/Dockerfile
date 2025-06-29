FROM node:18-alpine

WORKDIR /workspace

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4201

# Default command (can be overridden in docker-compose)
CMD ["npx", "nx", "serve", "dashboard", "--host", "0.0.0.0", "--port", "4201"] 