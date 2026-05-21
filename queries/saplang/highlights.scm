; ---------- Comments ----------
(line_comment) @comment
(block_comment) @comment

; ---------- Literals ----------
(number_literal) @number
(string_literal) @string
(escape_sequence) @string.escape
(char_literal) @character
(bool_literal) @boolean
(null_literal) @constant.builtin

; ---------- Keywords ----------
[
	"import"
	"export"
	"extern"
	"const"
	"defer"
] @keyword

[
	"struct"
	"union"
	"enum"
] @keyword.type

"fn" @keyword.function

"return" @keyword.return

[
	"if"
	"else"
	"switch"
	"case"
] @keyword.conditional

[
	"while"
	"for"
] @keyword.repeat

[
	"break"
	"continue"
] @keyword.repeat

[
	"sizeof"
	"alignof"
] @function.builtin

; ---------- Types ----------
(primitive_type) @type.builtin

(named_type
	(identifier) @type)

(named_type
	namespace: (identifier) @module
	name: (identifier) @type)

(struct_decl name: (identifier) @type.definition)
(union_decl name: (identifier) @type.definition)
(enum_decl name: (identifier) @type.definition)

; ---------- Functions ----------
(fn_decl name: (identifier) @function)
(extern_fn_decl name: (identifier) @function)

(call_expression
	callee: (identifier) @function.call)

(call_expression
	callee: (qualified_identifier
		namespace: (identifier) @module
		name: (identifier) @function.call))

(call_expression
	callee: (member_expression
		field: (identifier) @function.call))

; ---------- Fields / Members ----------
(field_decl name: (identifier) @variable.member)
(member_expression field: (identifier) @variable.member)
(designated_field_init field: (identifier) @variable.member)

; ---------- Variables / Parameters ----------
(parameter name: (identifier) @variable.parameter)
(var_decl_stmt name: (identifier) @variable)
(for_var_decl name: (identifier) @variable)
(global_var_decl name: (identifier) @variable)

; ---------- Identifiers ----------
(qualified_identifier
	namespace: (identifier) @module)

(enum_member name: (identifier) @constant)

; ---------- Operators / Punctuation ----------
[
	"+"
	"-"
	"*"
	"/"
	"%"
	"="
	"+="
	"-="
	"*="
	"/="
	"%="
	"=="
	"!="
	"<"
	"<="
	">"
	">="
	"&&"
	"||"
	"!"
	"&"
	"|"
	"^"
	"~"
	"<<"
	">>"
	"&="
	"|="
	"^="
	"<<="
	">>="
	".."
] @operator

"::" @operator

[
	";"
	","
	"."
] @punctuation.delimiter

[
	"("
	")"
	"{"
	"}"
	"["
	"]"
] @punctuation.bracket

(va_marker) @punctuation.special
