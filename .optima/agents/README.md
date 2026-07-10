# Repository Agents

Place full repository-local agent definitions here only when explicitly requested by the user.

- Use `.optima/agents/<agent>.md` only to intentionally override a bundled agent's full base definition.
- Use `.optima/agents/<agent>.md` only to define a brand new custom repository agent.
- Files in this folder are treated as full agent definitions and block bundled prompt updates for that agent.
- Prefer `.optima/agent-additions/<agent>.md` for normal repository-specific guidance.
- `README.md` is ignored by agent discovery.

## Include Types Available In Custom Agents

Custom agents can use the same include resolution as bundled agents:

- `<include:plugin:...>` for plugin-owned shared guidance
- `<include:policy:...>` for repository-overridable policy files with bundled defaults
- `<include:repo:...>` for explicit files under `.optima/`

## Common Plugin Includes

- `plugin:Agents_Common.md`
- `plugin:docs/core/agent_orchestration.md`
- `plugin:docs/core/communication_guidelines.md`
- `plugin:docs/core/discussion_agent_guidelines.md`
- `plugin:docs/core/role_contracts.md`
- `plugin:docs/core/task_model.md`
- `plugin:docs/core/codemap_conventions.md`
- `plugin:docs/core/pma_mode_full.md`
- `plugin:docs/core/pma_mode_mini.md`
- `plugin:docs/core/tech_lead_mode_full.md`
- `plugin:docs/core/tech_lead_mode_mini.md`

## Available Policy Includes

- `policy:development-guidelines.md`
- `policy:testing-guidelines.md`
- `policy:documentation-guidelines.md`
- `policy:git-commit-messaging.md`
- `policy:product-guidelines.md`
- `policy:ui-ux-guidelines.md`

## Legacy Content From .staticeng/agents/README.md

# Repository Agents

Place full repository-local agent definitions here only when explicitly requested by the user.

- Use `.staticeng/agents/<agent>.md` only to intentionally override a bundled agent's full base definition.
- Use `.staticeng/agents/<agent>.md` only to define a brand new custom repository agent.
- Files in this folder are treated as full agent definitions and block bundled prompt updates for that agent.
- Prefer `.staticeng/agent-additions/<agent>.md` for normal repository-specific guidance.
- `README.md` is ignored by agent discovery.

## Include Types Available In Custom Agents

Custom agents can use the same include resolution as bundled agents:

- `<include:plugin:...>` for plugin-owned shared guidance
- `<include:policy:...>` for repository-overridable policy files with bundled defaults
- `<include:repo:...>` for explicit files under `.staticeng/`

## Common Plugin Includes

- `plugin:Agents_Common.md`
- `plugin:docs/core/agent_orchestration.md`
- `plugin:docs/core/communication_guidelines.md`
- `plugin:docs/core/role_contracts.md`
- `plugin:docs/core/task_model.md`
- `plugin:docs/core/codemap_conventions.md`
- `plugin:docs/core/pma_mode_full.md`
- `plugin:docs/core/pma_mode_mini.md`
- `plugin:docs/core/tech_lead_mode_full.md`
- `plugin:docs/core/tech_lead_mode_mini.md`

## Available Policy Includes

- `policy:development-guidelines.md`
- `policy:testing-guidelines.md`
- `policy:documentation-guidelines.md`
- `policy:git-commit-messaging.md`
- `policy:product-guidelines.md`
- `policy:ui-ux-guidelines.md`
