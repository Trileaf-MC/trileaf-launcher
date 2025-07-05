.PHONY: sqlx-prepare sqlx-check help

# Generate SQLx query cache for app-lib
sqlx-prepare:
	@echo "Generating SQLx query cache..."
	@if command -v bash >/dev/null 2>&1; then \
		bash scripts/generate-sqlx-cache.sh packages/app-lib; \
	else \
		echo "Bash not found. Please run scripts/generate-sqlx-cache.bat on Windows"; \
		exit 1; \
	fi

# Generate SQLx query cache for labrinth
sqlx-prepare-labrinth:
	@echo "Generating SQLx query cache for labrinth..."
	@if command -v bash >/dev/null 2>&1; then \
		bash scripts/generate-sqlx-cache.sh apps/labrinth; \
	else \
		echo "Bash not found. Please run scripts/generate-sqlx-cache.bat apps/labrinth on Windows"; \
		exit 1; \
	fi

# Check if SQLx queries are up to date
sqlx-check:
	cd packages/app-lib && \
	export DATABASE_URL="sqlite:$$(pwd)/temp.db" && \
	sqlx database create && \
	sqlx migrate run && \
	cargo sqlx prepare --check && \
	rm -f temp.db

# Show help
help:
	@echo "Available targets:"
	@echo "  sqlx-prepare           - Generate SQLx query cache for app-lib"
	@echo "  sqlx-prepare-labrinth  - Generate SQLx query cache for labrinth"
	@echo "  sqlx-check             - Check if SQLx queries are up to date"
	@echo "  help                   - Show this help message" 