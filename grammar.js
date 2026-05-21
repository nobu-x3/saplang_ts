module.exports = grammar({
	name: 'saplang',

	word: $ => $.identifier,

	extras: $ => [
		/\s+/,
		$.line_comment,
		$.block_comment,
	],

	conflicts: $ => [
		[$.named_type, $._primary_expression],
		[$.named_type, $.qualified_identifier],
	],

	rules: {
		source_file: $ => repeat($._top_level),

		_top_level: $ => choice(
			$.import_decl,
			$.extern_block,
			$.fn_decl,
			$.struct_decl,
			$.union_decl,
			$.enum_decl,
			$.global_var_decl,
		),

		import_decl: $ => seq('import', field('name', $.identifier), ';'),

		extern_block: $ => seq(
			'extern',
			'{',
			repeat($._extern_item),
			'}'
		),

		_extern_item: $ => choice(
			$.extern_fn_decl,
			$.struct_decl,
			$.union_decl,
			$.enum_decl,
			$.global_var_decl,
		),

		extern_fn_decl: $ => seq(
			optional('export'),
			'fn',
			field('return_type', $._type),
			field('name', $.identifier),
			'(',
			optional($.parameter_list),
			')',
			';'
		),

		fn_decl: $ => seq(
			optional('export'),
			'fn',
			field('return_type', $._type),
			field('name', $.identifier),
			'(',
			optional($.parameter_list),
			')',
			field('body', $.block),
		),

		parameter_list: $ => seq(
			$.parameter,
			repeat(seq(',', $.parameter)),
			optional(seq(',', $.va_marker)),
		),

		parameter: $ => seq(
			optional('const'),
			field('type', $._type),
			optional(field('name', $.identifier)),
		),

		va_marker: $ => '...',

		struct_decl: $ => seq(
			optional('export'),
			'struct',
			field('name', $.identifier),
			'{',
			repeat($.field_decl),
			'}'
		),

		union_decl: $ => seq(
			optional('export'),
			'union',
			field('name', $.identifier),
			'{',
			repeat($.field_decl),
			'}'
		),

		enum_decl: $ => seq(
			optional('export'),
			'enum',
			field('name', $.identifier),
			optional(seq(':', field('base_type', $._type))),
			'{',
			optional(commaSep1($.enum_member)),
			optional(','),
			'}'
		),

		enum_member: $ => seq(
			field('name', $.identifier),
			optional(seq('=', field('value', $._expression))),
		),

		field_decl: $ => seq(
			field('type', $._type),
			field('name', $.identifier),
			optional(seq('=', field('default', $._expression))),
			optional(';'),
		),

		global_var_decl: $ => seq(
			optional('export'),
			optional('const'),
			field('type', $._type),
			field('name', $.identifier),
			optional(seq('=', field('init', $._expression))),
			';'
		),

		block: $ => seq('{', repeat($._statement), '}'),

		_statement: $ => choice(
			$.var_decl_stmt,
			$.return_stmt,
			$.if_stmt,
			$.while_stmt,
			$.for_stmt,
			$.switch_stmt,
			$.defer_stmt,
			$.break_stmt,
			$.continue_stmt,
			$.block,
			$.assignment_statement,
			$.expression_statement,
		),

		var_decl_stmt: $ => seq(
			optional('const'),
			field('type', $._type),
			field('name', $.identifier),
			optional(seq('=', field('init', $._expression))),
			';'
		),

		return_stmt: $ => seq('return', optional($._expression), ';'),

		if_stmt: $ => prec.right(seq(
			'if',
			'(', field('condition', $._expression), ')',
			field('consequence', $.block),
			optional(seq('else', field('alternative', choice($.block, $.if_stmt)))),
		)),

		while_stmt: $ => seq(
			'while', '(', field('condition', $._expression), ')',
			field('body', $.block)
		),

		for_stmt: $ => seq(
			'for', '(',
			field('init', optional($._for_init)), ';',
			field('condition', optional($._expression)), ';',
			field('step', optional($._for_step)), ')',
			field('body', $.block)
		),

		_for_init: $ => choice(
			$.for_var_decl,
			$.assignment_expression,
			$._expression,
		),

		for_var_decl: $ => seq(
			optional('const'),
			field('type', $._type),
			field('name', $.identifier),
			optional(seq('=', field('init', $._expression))),
		),

		_for_step: $ => choice($.assignment_expression, $._expression),

		switch_stmt: $ => seq(
			'switch', '(', field('subject', $._expression), ')',
			'{',
			repeat($.case_clause),
			optional($.else_clause),
			'}'
		),

		case_clause: $ => seq('case', field('value', $._expression), ':', repeat($._statement)),
		else_clause: $ => seq('else', field('body', $.block)),

		defer_stmt: $ => seq('defer', field('body', $.block)),
		break_stmt: $ => seq('break', ';'),
		continue_stmt: $ => seq('continue', ';'),

		expression_statement: $ => seq($._expression, ';'),

		assignment_statement: $ => seq($.assignment_expression, ';'),

		assignment_expression: $ => prec.right(0, seq(
			field('left', $._expression),
			field('op', choice('=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=')),
			field('right', $._expression),
		)),

		_expression: $ => choice(
			$.binary_expression,
			$.unary_expression,
			$.cast_expression,
			$._primary_expression,
		),

		_primary_expression: $ => choice(
			$.call_expression,
			$.member_expression,
			$.subscript_expression,
			$.slice_range_expression,
			$.parenthesized_expression,
			$.struct_literal,
			$.array_literal,
			$.qualified_identifier,
			$.identifier,
			$.number_literal,
			$.string_literal,
			$.char_literal,
			$.bool_literal,
			$.null_literal,
			$.sizeof_expression,
			$.alignof_expression,
		),

		binary_expression: $ => {
			const table = [
				[1, '||'],
				[2, '&&'],
				[3, '|'],
				[4, '^'],
				[5, '&'],
				[6, choice('==', '!=')],
				[7, choice('<', '<=', '>', '>=')],
				[8, choice('<<', '>>')],
				[9, choice('+', '-')],
				[10, choice('*', '/', '%')],
			];
			return choice(...table.map(([p, ops]) =>
				prec.left(p, seq(
					field('left', $._expression),
					field('op', ops),
					field('right', $._expression),
				))
			));
		},

		unary_expression: $ => prec.right(11, seq(
			field('op', choice('-', '!', '~', '*', '&', '++', '--')),
			field('operand', $._expression),
		)),

		cast_expression: $ => prec.right(12, seq(
			'(', field('type', $._type), ')',
			field('operand', $._expression),
		)),

		call_expression: $ => prec(14, seq(
			field('callee', choice($.qualified_identifier, $.identifier, $.member_expression, $.parenthesized_expression, $.subscript_expression)),
			'(',
			optional($.argument_list),
			')'
		)),

		argument_list: $ => commaSep1($._expression),

		member_expression: $ => prec.left(14, seq(
			field('object', $._primary_expression),
			'.',
			field('field', $.identifier),
		)),

		subscript_expression: $ => prec(14, seq(
			field('base', $._primary_expression),
			'[', field('index', $._expression), ']'
		)),

		slice_range_expression: $ => prec(14, seq(
			field('base', $._primary_expression),
			'[', field('lo', $._expression), '..', field('hi', $._expression), ']'
		)),

		parenthesized_expression: $ => seq('(', $._expression, ')'),

		struct_literal: $ => prec(1, seq(
			'{',
			optional(seq(commaSep1($._field_init), optional(','))),
			'}'
		)),

		_field_init: $ => choice(
			$.designated_field_init,
			$._expression,
		),

		designated_field_init: $ => seq(
			'.', field('field', $.identifier), '=', field('value', $._expression)
		),

		array_literal: $ => seq('[', optional(seq(commaSep1($._expression), optional(','))), ']'),

		qualified_identifier: $ => seq(
			field('namespace', $.identifier),
			'::',
			field('name', $.identifier),
		),

		sizeof_expression: $ => seq('sizeof', '(', choice($._type, $._expression), ')'),
		alignof_expression: $ => seq('alignof', '(', choice($._type, $._expression), ')'),

		_type: $ => choice(
			$.primitive_type,
			$.pointer_type,
			$.array_type,
			$.slice_type,
			$.function_pointer_type,
			$.named_type,
		),

		primitive_type: $ => choice(
			'void', 'bool',
			'i8', 'i16', 'i32', 'i64',
			'u8', 'u16', 'u32', 'u64',
			'f16', 'f32', 'f64',
		),

		pointer_type: $ => prec.left(seq($._type, '*')),

		array_type: $ => seq($._type, '[', field('size', $.number_literal), ']'),
		slice_type: $ => seq($._type, '[', ']'),

		function_pointer_type: $ => seq(
			'fn', '*',
			field('return_type', $._type),
			'(',
			optional(commaSep1($._type)),
			')'
		),

		named_type: $ => choice(
			$.identifier,
			seq(field('namespace', $.identifier), '::', field('name', $.identifier)),
		),

		identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

		number_literal: $ => token(choice(
			/0x[0-9a-fA-F_]+/,
			/0b[01_]+/,
			/0o[0-7_]+/,
			/\d[\d_]*(\.[\d_]+)?([eE][+-]?\d+)?[fFlLuU]?/,
		)),

		string_literal: $ => seq(
			'"',
			repeat(choice(
				token.immediate(prec(1, /[^"\\\n]+/)),
				$.escape_sequence,
			)),
			'"'
		),

		escape_sequence: $ => token.immediate(seq('\\', choice(
			/[abfnrtv0\\'"?]/,
			/x[0-9a-fA-F]{1,2}/,
			/u[0-9a-fA-F]{1,4}/,
		))),

		char_literal: $ => seq(
			"'",
			choice(
				token.immediate(/[^'\\]/),
				$.escape_sequence,
			),
			"'"
		),

		bool_literal: $ => choice('true', 'false'),
		null_literal: $ => 'null',

		line_comment: $ => token(seq('//', /[^\n]*/)),
		block_comment: $ => token(seq(
			'/*',
			/[^*]*\*+([^/*][^*]*\*+)*/,
			'/'
		)),
	}
});

function commaSep1(rule) {
	return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
	return optional(commaSep1(rule));
}
