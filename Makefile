.PHONY: setup dev seed test build down logs
setup:
	cp -n .env.example .env || true
	npm install
	docker compose up -d postgres redis minio create-bucket
	cd backend && npx prisma migrate dev && npm run prisma:seed
dev:
	docker compose up --build
seed:
	cd backend && npm run prisma:seed
test:
	npm test
build:
	npm run build
down:
	docker compose down
logs:
	docker compose logs -f
