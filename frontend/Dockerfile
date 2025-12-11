FROM oven/bun:1.1-alpine

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy source code
COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--host"]

