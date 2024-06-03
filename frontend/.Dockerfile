# Use a Node.js base image
FROM node:20.10

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install serve to serve the React app
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 5000

# Serve the React app
CMD ["serve", "-s", "build"]
