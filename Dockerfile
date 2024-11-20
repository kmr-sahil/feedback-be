# Use official Node.js image
FROM node:18

# Install required system libraries
RUN apt-get update && apt-get install -y openssl

# Set working directory
WORKDIR /app

# Copy only the package.json and package-lock.json files
COPY package.json package-lock.json /app/

# Install dependencies
RUN npm install

# Copy the remaining files
COPY . /app/

# Install TypeScript globally
RUN npm install -g typescript

# Add a script to modify schema.prisma based on NODE_ENV
RUN echo '#!/bin/sh \n\
if [ "$NODE_ENV" = "production" ]; then \n\
  sed -i "s/binaryTargets = \\[.*\\]/binaryTargets = [\\"native\\", \\"debian-openssl-3.0.x\\"]/" prisma/schema.prisma; \n\
else \n\
  sed -i "/binaryTargets = \\[.*\\]/d" prisma/schema.prisma; \n\
fi' > set-prisma-binary-targets.sh && chmod +x set-prisma-binary-targets.sh

# Run the script to adjust schema.prisma
RUN ./set-prisma-binary-targets.sh

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN tsc

# Expose the port your app runs on
EXPOSE 8080

# Start the compiled JavaScript app
CMD ["node", "dist/index.js"]
