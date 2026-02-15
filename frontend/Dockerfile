FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies to avoid lockfile issues
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy application
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
