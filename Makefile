.DEFAULT_GOAL := help

install: ## Install npm dependencies
	docker run --rm -w /app -u `id -u`:`id -g` -v .:/app node:23.5.0 npm install

up: ## Start the development server
	docker run --rm -d --name yii3-landing -w /app -u `id -u`:`id -g` -v .:/app -p 3000:3000 node:23.5.0 npm run dev -- --host=0.0.0.0 --port=3000

down: ## Stop the development server
	docker stop yii3-landing

build: ## Build the production version
	docker run --rm -w /app -u `id -u`:`id -g` -v .:/app node:23.5.0 npm run build

# Output the help for each task, see https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
