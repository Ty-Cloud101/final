FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy server.js AND src folder
COPY server.js ./
COPY src/ ./src/

EXPOSE 5000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server.js"]
