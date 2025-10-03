.PHONY: help build up down restart logs shell-api shell-web migrate makemigrations createsuperuser test test-api test-web clean prune setup dev status

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

##@ General

help: ## Show this help message
	@echo '$(GREEN)TalentBase - Docker Development Environment$(NC)'
	@echo ''
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

setup: ## Initial setup (create .env files, install dependencies)
	@echo "$(GREEN)Setting up environment...$(NC)"
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@if [ ! -f packages/web/.env ]; then cp packages/web/.env.example packages/web/.env; fi
	@if [ ! -f apps/api/.env ]; then cp apps/api/.env.example apps/api/.env; fi
	@echo "$(GREEN)Environment files created!$(NC)"
	@echo "$(YELLOW)Please review and update .env files if needed$(NC)"

build: ## Build all Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker compose build

up: ## Start all services
	@echo "$(GREEN)Starting all services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend:  http://localhost:8000$(NC)"
	@echo "$(YELLOW)Health:   http://localhost:8000/health/$(NC)"

dev: setup build up logs ## Complete dev setup (setup + build + start + logs)

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker compose down

restart: down up ## Restart all services

stop: ## Stop services without removing containers
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker compose stop

start: ## Start stopped services
	@echo "$(GREEN)Starting services...$(NC)"
	docker compose start

##@ Database

migrate: ## Run Django migrations
	@echo "$(GREEN)Running migrations...$(NC)"
	docker compose exec api python manage.py migrate

makemigrations: ## Create new Django migrations
	@echo "$(GREEN)Creating migrations...$(NC)"
	docker compose exec api python manage.py makemigrations

createsuperuser: ## Create Django superuser
	@echo "$(GREEN)Creating superuser...$(NC)"
	docker compose exec api python manage.py createsuperuser

db-shell: ## Open PostgreSQL shell
	@echo "$(GREEN)Opening database shell...$(NC)"
	docker compose exec postgres psql -U talentbase -d talentbase_dev

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)WARNING: This will destroy all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker compose up -d postgres redis; \
		sleep 5; \
		docker compose up -d api; \
		sleep 10; \
		$(MAKE) migrate; \
	fi

##@ Logs & Monitoring

logs: ## Show logs from all services (follow mode)
	docker compose logs -f

logs-api: ## Show API logs
	docker compose logs -f api

logs-web: ## Show frontend logs
	docker compose logs -f web

logs-postgres: ## Show PostgreSQL logs
	docker compose logs -f postgres

logs-redis: ## Show Redis logs
	docker compose logs -f redis

status: ## Show status of all services
	@echo "$(GREEN)Service Status:$(NC)"
	@docker compose ps

health: ## Check health of all services
	@echo "$(GREEN)Checking service health...$(NC)"
	@echo "\n$(YELLOW)PostgreSQL:$(NC)"
	@docker compose exec postgres pg_isready -U talentbase || echo "$(RED)❌ Not healthy$(NC)"
	@echo "\n$(YELLOW)Redis:$(NC)"
	@docker compose exec redis redis-cli ping || echo "$(RED)❌ Not healthy$(NC)"
	@echo "\n$(YELLOW)API Health Check:$(NC)"
	@curl -s http://localhost:8000/health/ | python3 -m json.tool || echo "$(RED)❌ Not accessible$(NC)"

##@ Shell Access

shell-api: ## Open shell in API container
	@echo "$(GREEN)Opening API shell...$(NC)"
	docker compose exec api bash

shell-web: ## Open shell in Web container
	@echo "$(GREEN)Opening Web shell...$(NC)"
	docker compose exec web sh

shell-postgres: ## Open PostgreSQL container shell
	@echo "$(GREEN)Opening PostgreSQL shell...$(NC)"
	docker compose exec postgres sh

shell-redis: ## Open Redis container shell
	@echo "$(GREEN)Opening Redis shell...$(NC)"
	docker compose exec redis sh

##@ Testing

test: test-api test-web ## Run all tests

test-api: ## Run API tests
	@echo "$(GREEN)Running API tests...$(NC)"
	docker compose exec api poetry run pytest -v

test-web: ## Run frontend tests
	@echo "$(GREEN)Running frontend tests...$(NC)"
	docker compose exec web pnpm test

test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	docker compose exec web pnpm test tests/integration/

coverage-api: ## Generate API test coverage report
	@echo "$(GREEN)Generating API coverage report...$(NC)"
	docker compose exec api poetry run pytest --cov=. --cov-report=html

##@ Code Quality

lint: lint-api lint-web ## Run all linting

lint-api: ## Run API linting (ruff + black)
	@echo "$(GREEN)Running API linting...$(NC)"
	docker compose exec api poetry run ruff check .
	docker compose exec api poetry run black --check .

lint-web: ## Run frontend linting (eslint)
	@echo "$(GREEN)Running frontend linting...$(NC)"
	docker compose exec web pnpm --filter @talentbase/web lint

typecheck: ## Run TypeScript type checking
	@echo "$(GREEN)Running TypeScript type checking...$(NC)"
	docker compose exec web pnpm typecheck

format: format-api format-web ## Format all code

format-api: ## Format API code (black + ruff)
	@echo "$(GREEN)Formatting API code...$(NC)"
	docker compose exec api poetry run black .
	docker compose exec api poetry run ruff check --fix .

format-web: ## Format frontend code (prettier)
	@echo "$(GREEN)Formatting frontend code...$(NC)"
	docker compose exec web pnpm format

format-check: ## Check code formatting without changes
	@echo "$(GREEN)Checking code formatting...$(NC)"
	@echo "\n$(YELLOW)Backend:$(NC)"
	docker compose exec api poetry run black --check .
	@echo "\n$(YELLOW)Frontend:$(NC)"
	docker compose exec web pnpm format:check

lint-fix: ## Fix linting issues automatically
	@echo "$(GREEN)Fixing linting issues...$(NC)"
	@echo "\n$(YELLOW)Backend:$(NC)"
	docker compose exec api poetry run black .
	docker compose exec api poetry run ruff check --fix .
	@echo "\n$(YELLOW)Frontend:$(NC)"
	docker compose exec web pnpm lint:fix

##@ Cleanup

clean: down ## Stop services and remove containers
	@echo "$(YELLOW)Removing containers...$(NC)"
	docker compose rm -f

prune: ## Remove all unused Docker resources (dangerous!)
	@echo "$(RED)WARNING: This will remove all unused Docker resources!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -af --volumes; \
	fi

clean-logs: ## Clear Docker logs
	@echo "$(YELLOW)Clearing Docker logs...$(NC)"
	docker compose logs --no-log-prefix > /dev/null 2>&1

##@ Build & Deploy

build-prod: ## Build production images
	@echo "$(GREEN)Building production images...$(NC)"
	docker compose -f docker-compose.prod.yml build

deploy-prod: ## Deploy to production (requires docker-compose.prod.yml)
	@echo "$(GREEN)Deploying to production...$(NC)"
	docker compose -f docker-compose.prod.yml up -d

##@ Design System

storybook: ## Run Storybook for design system
	@echo "$(GREEN)Starting Storybook...$(NC)"
	cd packages/design-system && pnpm dev

build-design-system: ## Build design system
	@echo "$(GREEN)Building design system...$(NC)"
	docker compose exec web sh -c "cd /app/packages/design-system && pnpm build"

##@ Quick Actions

ps: status ## Alias for status

restart-api: ## Restart only API service
	docker compose restart api

restart-web: ## Restart only Web service
	docker compose restart web

rebuild: clean build up ## Clean rebuild everything

fresh: db-reset ## Fresh start with clean database
	@echo "$(GREEN)Fresh start complete!$(NC)"
