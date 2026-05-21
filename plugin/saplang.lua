-- Auto-loaded once this repo is on runtimepath (packer, lazy, plug, native packages — all the same).
-- Registers Saplang with nvim-treesitter and maps the .sl filetype. Queries are picked up automatically
-- from this repo's queries/saplang/ since it's now in rtp.

if vim.fn.has("nvim-0.9") == 0 then
	return
end

local ok, parsers = pcall(require, "nvim-treesitter.parsers")
if not ok then
	return
end

local parser_config = parsers.get_parser_configs()
if not parser_config.saplang then
	parser_config.saplang = {
		install_info = {
			url = "https://github.com/USER/tree-sitter-saplang", -- TODO: swap to the real URL
			files = { "src/parser.c" },
			generate_requires_npm = false,
			requires_generate_from_grammar = false,
		},
		filetype = "sl",
	}
end

vim.filetype.add({ extension = { sl = "saplang" } })
