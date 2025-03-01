FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate routes and swagger documentation
RUN bun run build

EXPOSE 3001

CMD ["bun", "run", "start"]