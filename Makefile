COMPOSE_FILES := -f compose.yaml
COMPOSE_PROD_FILES := -f compose.yaml -f compose.prod.yaml
SYMFONY_DIR := ./symfony
FRONT_DIR := ./front

ifeq ($(OS),Windows_NT)
	SYMFONY_DIR_WIN := $(subst /,\,$(SYMFONY_DIR))
	FRONT_DIR_WIN := $(subst /,\,$(FRONT_DIR))
	COPY_ENV = cmd /C "copy /Y .env* $(SYMFONY_DIR_WIN) && copy /Y .env* $(FRONT_DIR_WIN)"
	RESET_DB = DEL /S /Q .\database\*
else
	COPY_ENV = cp -vf .env* $(SYMFONY_DIR) 2>/dev/null && cp -vf .env* $(FRONT_DIR) 2>/dev/null
	RESET_DB = sudo rm -rf ./database/*
endif

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
	@$(RESET_DB)

stop:
	docker compose $(COMPOSE_FILES) down || true
	docker compose $(COMPOSE_PROD_FILES) down || true

copy-env:
	@$(COPY_ENV)

restart-prod: stop build-start-prod-bg

update-prod: stop
	git pull
	$(MAKE) build-start-prod-bg