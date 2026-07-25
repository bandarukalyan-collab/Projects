# MCP Tools Reference

This document lists the verified MCP tools available for use in the SDD skills and their usage patterns.

## Verified JIRA MCP Tools

| Tool | Purpose | Status | Usage Example |
|------|---------|--------|--------------|
| `mcp2_jira_get_issue` | Fetch JIRA issue details | ✅ Verified | `mcp2_jira_get_issue issue_key: {ISSUE_ID} fields: summary,description` |
| `mcp2_jira_add_comment` | Add comment to JIRA issue | ✅ Verified | `mcp2_jira_add_comment issue_key: {ISSUE_ID} body: {comment_text}` |
| `mcp2_jira_get_transitions` | Get available status transitions | ✅ Verified | `mcp2_jira_get_transitions issue_key: {ISSUE_ID}` |
| `mcp2_jira_transition_issue` | Transition issue to new status | ✅ Verified | `mcp2_jira_transition_issue issue_key: {ISSUE_ID} transition_id: {id}` |

## Unavailable MCP Tools (Use Curl Fallback)

| Tool | Purpose | Status | Curl Alternative |
|------|---------|--------|------------------|
| `mcp2_jira_upload_attachments` | Upload files to JIRA issue | ❌ Not Available | Use curl with `--form` parameter |
| `mcp2_jira_add_label` | Add label to JIRA issue | ❌ Not Available | Use curl with update API or add comment |

## Usage Patterns

### MCP-First Pattern
```markdown
**Primary Method: Use MCP Tool**

```
mcp2_jira_get_issue
  issue_key: {ISSUE_ID}
  fields: summary,description
```

**Curl Fallback Method**

```bash
# Get configuration
JIRA_PAT=$(grep JIRA_PAT "$WORKSPACE_ROOT/local.config" | cut -d= -f2)
JIRA_BASE_URL=$(grep JIRA_BASE_URL "$WORKSPACE_ROOT/local.config" | cut -d= -f2)

# Execute curl command
curl -s \
  --header "Authorization: Bearer $JIRA_PAT" \
  "${JIRA_BASE_URL}/rest/api/2/issue/${ISSUE_ID}?fields=summary,description"
```
```

### Field Mapping Differences

| Field | MCP Response Path | Curl Response Path |
|-------|-------------------|-------------------|
| Summary | `summary` | `fields.summary` |
| Description | `description` | `fields.description` |
| Labels | `labels[]` | `fields.labels[]` |
| Custom Fields | Varies by tool | `fields.{custom_field_id}` |

## Best Practices

1. **Always use MCP tools first** - They handle authentication automatically
2. **Provide comprehensive curl fallbacks** - Include configuration loading and error handling
3. **Document field mapping differences** - MCP and curl APIs have different response structures
4. **Test new tools before deployment** - Verify tool availability in staging environment
5. **Keep curl commands up-to-date** - Ensure they match the latest JIRA API specification

## Adding New MCP Tools

Before adding a new MCP tool to any skill:

1. Verify the tool exists in the MCP server
2. Test the tool with sample data
3. Document the tool in this reference
4. Provide curl fallback implementation
5. Update the relevant skill with MCP-first pattern

## Configuration

MCP servers are configured in `oauth-mcp-servers.json`:
- JIRA servers: `jira-it-stage` and `jira-it`
- Confluence servers: `confluence-it-stage` and `confluence-it`
- GitLab servers: `gitlab` and `gitlab-np`

Note: The server configuration only provides endpoints, not tool lists. Tool availability must be verified empirically.
