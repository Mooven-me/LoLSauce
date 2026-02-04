COMPOSE_FILES := -f compose.yaml
COMPOSE_PROD_FILES := -f compose.yaml -f compose.prod.yaml
COMPOSE_PROD_PROXY_FILES := -f compose.yaml -f compose.prod.yaml -f compose.proxy_override.yaml
SYMFONY_DIR := ./symfony
FRONT_DIR := ./front

ifeq ($(OS),Windows_NT)
	RESET_DB = DEL /S /Q .\database\*
else
	RESET_DB = sudo rm -rf ./database/*
endif

###> Dev part

start:
	docker compose $(COMPOSE_FILES) up

build:
	docker compose $(COMPOSE_FILES) build

build-start: build start

###> Production part

build-prod:
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) build --no-cache

build-prod-proxy:
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_PROXY_FILES) build --no-cache

build-start-prod: build-prod start-prod

build-start-prod-bg: build-prod start-prod-bg

build-start-prod-proxy-bg: build-prod-proxy start-prod-proxy-bg

start-prod:
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) up
	
start-prod-bg:
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_FILES) up -d

start-prod-proxy-bg:
	docker compose --env-file .env --env-file .env.prod $(COMPOSE_PROD_PROXY_FILES) up -d
###> Utils part

reset-database:
	@$(RESET_DB)

stop:
	docker compose $(COMPOSE_FILES) down || true
	docker compose $(COMPOSE_PROD_FILES) down || true

restart-prod: stop build-start-prod-bg

update-prod: stop
	git pull
	$(MAKE) build-start-prod-bg

update-prod-proxy: stop
	git pull
	$(MAKE) build-start-prod-proxy-bg