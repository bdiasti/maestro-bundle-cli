# Naming Conventions Reference

## Tables
- `snake_case`, plural: `demands`, `tasks`, `tracking_events`
- Junction tables: `<table1>_<table2>` alphabetically: `agents_tasks`

## Columns
- Primary key: `id` (always UUID with `gen_random_uuid()`)
- Foreign key: `<singular_table>_id`: `demand_id`, `agent_id`
- Boolean: `is_<adjective>`: `is_active`, `is_verified`
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Status: `status VARCHAR(20)` with constrained values

## Indexes
- Format: `idx_<table>_<columns>`: `idx_tasks_status`, `idx_tasks_demand_id`
- Unique: `uq_<table>_<columns>`: `uq_users_email`
- Partial: suffix with purpose: `idx_tasks_status_active`

## Constraints
- Primary key: `pk_<table>`: `pk_demands`
- Foreign key: `fk_<table>_<referenced>`: `fk_tasks_demands`
- Unique: `uq_<table>_<columns>`: `uq_users_email`
- Check: `ck_<table>_<rule>`: `ck_demands_status_valid`

## Migrations
- Format: `NNN_<action>_<table>.py`: `001_create_demands.py`, `002_add_tasks_status_index.py`
- Actions: `create`, `add`, `alter`, `drop`, `rename`
