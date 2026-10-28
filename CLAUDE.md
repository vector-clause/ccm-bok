# Project rules for Claude

- **No AI attribution, ever.** Commit messages and PR descriptions must not contain `Co-Authored-By: Claude`, "Generated with Claude Code", or any other mention of AI authorship.
- Code is MIT (`LICENSE`); content is CC BY-NC-SA 4.0 (`LICENSE-CONTENT.md`).
- Generated pages come from `npm run convert` (bootstrap only; never overwrites pages whose status isn't `stub`).
- Builds need Node >= 22.23.4 (`/opt/homebrew/bin` has one on this machine).
