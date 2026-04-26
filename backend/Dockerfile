FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY server.js ./
COPY src/ ./src/

# Create data directory with proper permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Switch to non-root user
USER node

EXPOSE 5000
CMD ["node", "server.js"]
