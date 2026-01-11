.PHONY: build push deploy bp help clean

# Default version if not set
VERSION ?= latest

help: ## Show this help message
	@echo 'Usage: make [target] VERSION=x.x.x'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build Docker image (usage: make build VERSION=v1.0.3)
	@echo "Building personal-manager with version: $(VERSION)"
	VERSION=$(VERSION) docker compose build personal-manager

push: ## Push Docker image to registry (usage: make push VERSION=v1.0.3)
	@echo "Pushing personal-manager with version: $(VERSION)"
	docker compose push personal-manager

bp: build push ## Shorthand for build and push (usage: make bp VERSION=v1.0.3)
	@echo "✅ Successfully built and pushed personal-manager:$(VERSION)"

deploy: build push ## Build and push Docker image (usage: make deploy VERSION=v1.0.3)
	@echo "Successfully deployed personal-manager:$(VERSION)"

clean: ## Remove local Docker images
	@echo "Removing local images..."
	docker rmi aritraghorai/personal-manger:$(VERSION) || true
	docker rmi aritraghorai/personal-manger:latest || true
