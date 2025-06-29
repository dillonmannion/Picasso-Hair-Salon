# Claude Commands Explained: A Comprehensive Guide

This guide provides an in-depth explanation of how to use custom Claude commands, various ways to edit Claude's functionality through these commands, and advanced customization options available in Claude Code.

## Table of Contents

1. [Introduction to Claude Code](#introduction-to-claude-code)
2. [Basic Commands and Usage](#basic-commands-and-usage)
3. [Slash Commands](#slash-commands)
4. [CLAUDE.md Files and Memory Management](#claudemd-files-and-memory-management)
5. [MCP (Model Context Protocol) Integration](#mcp-model-context-protocol-integration)
6. [Tool Usage and Customization](#tool-usage-and-customization)
7. [Advanced Configuration Options](#advanced-configuration-options)
8. [Environment Variables and Model Customization](#environment-variables-and-model-customization)
9. [Permission Rules and Security](#permission-rules-and-security)
10. [Best Practices and Tips](#best-practices-and-tips)

## Introduction to Claude Code

Claude Code is Anthropic's official CLI tool that integrates directly with your terminal to help you code faster. It understands your codebase and can perform various actions like editing files, fixing bugs, and answering questions using natural language commands.

### Installation

```bash
npm install -g @anthropic-ai/claude-code
```

### Starting Claude Code

```bash
claude
```

This launches the interactive REPL (Read-Eval-Print Loop) session where you can directly prompt Claude with natural language commands.

## Basic Commands and Usage

### Interactive Mode

Once you've started Claude Code with the `claude` command, you can interact with it using natural language prompts:

```shell
> summarize this project
> fix the syntax error in primes.py
> run the build and fix any type errors
```

### Navigation

Before starting Claude Code, navigate to your project directory:

```shell
cd your-project-directory
claude
```

## Slash Commands

Slash commands provide quick access to specific Claude Code features. They are typed directly in the interactive session.

### Memory and Configuration Commands

#### `/init`
Initializes a `CLAUDE.md` file for your project. This command bootstraps a central repository for important project information, conventions, and frequently used commands.

```shell
> /init
```

#### `/config`
Opens the general configuration menu for Claude Code settings.

```shell
> /config
```

#### `/vim`
Enables Vim keybindings within Claude Code. This supports a subset of Vim commands for mode switching, navigation, and editing.

```shell
> /vim
```

### Terminal Setup

#### `/terminal-setup`
Automatically configures Shift+Enter as a more intuitive alternative for entering line breaks in iTerm2 and VS Code terminals.

```shell
> /terminal-setup
```

### MCP Server Commands

#### `/mcp__servername__promptname`
Execute custom prompts exposed by MCP servers. These appear dynamically based on installed MCP servers.

```shell
> /mcp__github__list_prs
> /mcp__github__pr_review 456
> /mcp__jira__create_issue "Bug in login flow" high
```

### Quick Memory Addition

Using the `#` prefix allows you to quickly add new memory entries:

```shell
# Always use descriptive variable names
```

This prompts you to select a memory file for storage, streamlining the process of capturing immediate insights or instructions.

## CLAUDE.md Files and Memory Management

CLAUDE.md files are special markdown files that provide project-specific guidance to Claude Code. They can be placed at the root of your project and in subdirectories.

### Basic Structure

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Fundamental Rules
- Reference the CLAUDE.md files in subdirectories for directory-specific information
- Always produce code aligned with the prompt

## Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run test` - Run tests
```

### Importing Files

CLAUDE.md files support importing other files using the `@path/to/import` syntax:

```markdown
See @README for project overview and @package.json for available npm commands.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

### Individual Preferences

Import personal preferences not checked into the repository:

```markdown
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

**Note**: The `@path/to/import` syntax is not evaluated inside code spans or code blocks to avoid conflicts.

### Custom Compaction Instructions

You can guide Claude's conversation compaction behavior:

```markdown
# Summary instructions

When you are using compact, please focus on test output and code changes
```

## MCP (Model Context Protocol) Integration

MCP allows Claude Code to integrate with external tools and services through standardized server connections.

### Adding MCP Servers

#### Standard Server (stdio)
```bash
claude mcp add my-server /path/to/server
```

#### With Arguments
```bash
claude mcp add weather-server /usr/local/bin/weather --api-key abc123
```

#### SSE Server
```bash
claude mcp add --transport sse sse-server https://example.com/sse-endpoint
```

#### From JSON Configuration
```bash
claude mcp add-json weather-api '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'
```

### Managing MCP Servers

#### List All Servers
```bash
claude mcp list
```

#### Get Server Details
```bash
claude mcp get weather-api
```

#### Remove a Server
```bash
claude mcp remove my-server
```

### Starting Claude Code as an MCP Server

Claude Code itself can act as an MCP server:

```bash
claude mcp serve
```

This enables other MCP clients (like Claude Desktop) to connect and utilize Claude's integrated tools.

## Tool Usage and Customization

Claude Code provides various built-in tools that can be extended and customized.

### Text Editor Tool

The text editor tool supports multiple commands:

#### View Command
```json
{
  "command": "view",
  "path": "primes.py",
  "view_range": [10, 20]  // Optional: view specific lines
}
```

#### String Replace Command
```json
{
  "command": "str_replace",
  "path": "primes.py",
  "old_str": "for num in range(2, limit + 1)",
  "new_str": "for num in range(2, limit + 1):"
}
```

#### Create Command
```json
{
  "command": "create",
  "path": "test_primes.py",
  "file_text": "import unittest\n# Test content here"
}
```

#### Insert Command
```json
{
  "command": "insert",
  "path": "primes.py",
  "insert_line": 0,
  "new_str": "# Module docstring here\n"
}
```

### Custom Tool Integration

You can define custom tools when using the Claude API:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-20250514",
    "tools": [{
      "name": "get_weather",
      "description": "Get current weather",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": {"type": "string"}
        },
        "required": ["location"]
      }
    }],
    "messages": [{"role": "user", "content": "What's the weather?"}]
  }'
```

## Advanced Configuration Options

### Environment Variables

Claude Code behavior can be customized through environment variables:

#### Model Selection
```bash
export ANTHROPIC_MODEL='claude-opus-4@20250514'
export ANTHROPIC_SMALL_FAST_MODEL='claude-3-5-haiku@20241022'
```

#### AWS/Bedrock Configuration
```bash
export AWS_REGION=us-east-1
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:account-id:model/model-id'
```

### Tool Choice Configuration

Force Claude to use specific tools:

```python
tool_choice = {"type": "tool", "name": "get_weather"}
```

Or allow any tool:

```python
tool_choice = {"type": "any"}
```

### Streaming Configuration

Enable fine-grained tool streaming for better real-time responses:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "anthropic-beta: fine-grained-tool-streaming-2025-05-14" \
  -d '{
    "stream": true,
    "tools": [...],
    "messages": [...]
  }'
```

## Permission Rules and Security

Claude Code supports fine-grained permission control through policy files.

### Permission Rule Syntax

```
Tool(optional-specifier)
```

Examples:
- `Bash(npm run build)` - Allow specific command
- `Bash(npm run test:*)` - Allow pattern matching
- `Edit(docs/**)` - Allow editing in specific directories
- `Read(~/.zshrc)` - Allow reading specific files
- `WebFetch(domain:example.com)` - Domain-specific web access
- `mcp__puppeteer__puppeteer_navigate` - Specific MCP tool access

### Policy File Locations

Enterprise policy files are located at:
- macOS/Linux: `/Library/Application Support/ClaudeCode/policies.json`
- Linux (alternative): `/etc/claude-code/policies.json`

## Best Practices and Tips

### 1. Project-Specific Instructions

Always create a `CLAUDE.md` file at your project root with:
- Essential commands specific to your project
- Code style guidelines
- Testing procedures
- Deployment instructions

### 2. Use Todo Management

For complex tasks, use Claude's todo management:

```
I'll help you implement a usage metrics feature. Let me create a todo list:
1. Research existing metrics tracking
2. Design metrics collection system
3. Implement core tracking functionality
4. Create export functionality
```

### 3. Chain of Thought Prompting

For better tool usage, encourage analysis:

```
Answer the user's request using relevant tools. Before calling a tool, 
do some analysis within <thinking></thinking> tags.
```

### 4. Handling Errors

When tools fail, provide clear error messages:

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_123",
  "content": "Error: No match found. Please check your text.",
  "is_error": true
}
```

### 5. Batch Operations

Use parallel tool calls for better performance:

```python
# Run multiple bash commands in parallel
response = client.messages.create(
    tools=[bash_tool],
    messages=[
        {"role": "user", "content": "Check git status and run tests"}
    ]
)
```

### 6. Security Considerations

- Never store API keys or secrets in CLAUDE.md files
- Use environment variables for sensitive configuration
- Be cautious with web fetch and file system permissions
- Review permission policies regularly

### 7. Performance Optimization

- Use caching for repeated API calls
- Batch related operations together
- Specify appropriate `max_tokens` limits
- Use streaming for long-running operations

## Conclusion

Claude Code's command system provides powerful ways to customize and extend its functionality. By leveraging slash commands, CLAUDE.md files, MCP integration, and advanced configuration options, you can create a highly tailored development experience that fits your specific workflow and project needs.

Remember to regularly update your CLAUDE.md files as your project evolves, and take advantage of the permission system to maintain security while enabling productive workflows.