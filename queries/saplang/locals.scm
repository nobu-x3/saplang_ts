; ---------- Scopes ----------
[
	(fn_decl)
	(block)
	(for_stmt)
	(while_stmt)
	(if_stmt)
	(switch_stmt)
] @local.scope

; ---------- Definitions ----------
(parameter name: (identifier) @local.definition.parameter)
(var_decl_stmt name: (identifier) @local.definition.var)
(for_var_decl name: (identifier) @local.definition.var)
(fn_decl name: (identifier) @local.definition.function)
(struct_decl name: (identifier) @local.definition.type)
(union_decl name: (identifier) @local.definition.type)
(enum_decl name: (identifier) @local.definition.type)
(global_var_decl name: (identifier) @local.definition.var)

; ---------- References ----------
(identifier) @local.reference
