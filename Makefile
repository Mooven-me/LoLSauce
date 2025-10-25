COMPOSE_FILES := -f compose.yaml
COMPOSE_PROD_FILES := -f compose.yaml -f compose.prod.yaml
SYMFONY_DIR := ./symfony

copy-env:
	@cp -vf .env* $(SYMFONY_DIR) 2>/dev/null

start: copy-env
	docker compose $(COMPOSE_FILES) up

start-prod: copy-env
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) up

build-prod: copy-env
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) build

build: copy-env
	docker compose $(COMPOSE_FILES) build

build-start-prod: build-prod start-prod

build-start: build start

reset-database:
	sudo rm -rf ./database/*

stop:
	docker compose $(COMPOSE_FILES) down || true
	docker compose $(COMPOSE_PROD_FILES) down || true