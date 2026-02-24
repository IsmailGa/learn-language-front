# Use Node.js as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the development server
# --host 0.0.0.0 allows access from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
