# tree-sitter-saplang

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for
[Saplang](https://github.com/nobu-x3/saplang).

Provides syntax highlighting, folds, and locals queries for Neovim via
[`nvim-treesitter`](https://github.com/nvim-treesitter/nvim-treesitter).

## Install (Neovim + packer)

```lua
use {
	"nobu-x3/tree-sitter-saplang",
	requires = "nvim-treesitter/nvim-treesitter",
}
```

Then run, once:

```
:PackerSync
:TSInstall saplang
```

Open a `.sl` file and you should see highlighting. The bundled `plugin/saplang.lua`
runs on startup once the repo is on runtimepath — it registers the parser with
nvim-treesitter and maps the `.sl` extension. Queries (`queries/saplang/*.scm`) are
picked up automatically since packer puts the repo on rtp.

### Other plugin managers

The bundled `plugin/saplang.lua` is auto-sourced by any plugin manager that
puts the repo on runtimepath (lazy.nvim, vim-plug, native `:packadd`, …).
Replace the `use { ... }` spec with the equivalent for your manager.
