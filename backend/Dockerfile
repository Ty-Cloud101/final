FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy only what's needed (not everything)
COPY src/ ./src/

EXPOSE 5000

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "index.js"]
