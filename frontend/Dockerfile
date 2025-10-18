FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application
COPY . .

# Build application
RUN yarn build

# Install serve to run the build
RUN yarn global add serve

# Expose port
EXPOSE 3000

# Run application
CMD ["serve", "-s", "build", "-l", "3000"]
