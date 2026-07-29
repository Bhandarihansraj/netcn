# PROJECT_INDEX — netcn Toolbox

## Meta
- Project: netcn
- Type: ASP.NET MVC / Web API Toolbox
- Stack: C#, .NET Framework 4.7.2, jQuery, Bootstrap
- Last Updated: 2026-07-28

## Module Map
| File | Role | Exports | Status | Agents Run |
|------|------|---------|--------|------------|
| Models/GitHubDataService.cs | Core Service | GitHubDataService | ✅ reviewed | ORCHESTRATOR, FORGE |
| Controllers/ToolboxController.cs | Main Controller | ToolboxController | ✅ reviewed | ORCHESTRATOR, FORGE |
| Views/Toolbox/DragDrop.cshtml | UI View | HTML/JS | ✅ reviewed | ORCHESTRATOR, FORGE |
| Controllers/HomeController.cs | Default Controller| HomeController | ✅ default | none |

## Dependency Graph
ToolboxController.cs → GitHubDataService.cs
DragDrop.cshtml (AJAX) → ToolboxController.cs

## Open Issues
- [ ] Need to add new tool features to the Toolbox.
- [ ] Connect GitHub project management for issue tracking.

## Architecture Decisions
- [ADR-001] The project uses GitHub as a headless CMS / CDN. Pre-filled data is stored in the GitHub repository's `data/` folder and fetched dynamically.
- [ADR-002] Git history is kept clean of `.gitignore`, `bin`, and `obj` folders to prevent sensitive data leaks.

## Context Notes (for next chat)
- GitHub Data URL base: `https://raw.githubusercontent.com/Bhandarihansraj/netcn/master/data/`
- First test tool "DragDrop" is fully functional and uses AJAX.
