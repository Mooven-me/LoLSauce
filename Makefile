COMPOSE_FILES := -f compose.yaml
COMPOSE_PROD_FILES := -f compose.yaml -f compose.prod.yaml
SYMFONY_DIR := ./symfony
FRONT_DIR := ./front

###> Dev part

start: copy-env
	docker compose $(COMPOSE_FILES) up

build: copy-env
	docker compose $(COMPOSE_FILES) build

build-start: build start

###> Production part

build-prod: copy-env
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) build

build-start-prod: build-prod start-prod

build-start-prod-bg: build-prod start-prod-bg

start-prod: copy-env
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) up
	
start-prod-bg: copy-env
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) up -d
###> Utils part

reset-database:
	sudo rm -rf ./database/*

stop:
	docker compose $(COMPOSE_FILES) down || true
	docker compose $(COMPOSE_PROD_FILES) down || true

copy-env:
	@cp -vf .env* $(SYMFONY_DIR) 2>/dev/null
	@cp -vf .env* $(FRONT_DIR) 2>/dev/null
