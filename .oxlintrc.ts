/*
 * Copied from the YCM2 shared Oxlint configuration (packages/oxlint/.oxlintrc.ts).
 * Deviations: the YCM2 JS plugins (`ycm2/import-boundaries`, `ycm2-style/statement-spacing`) and their
 * rules are omitted. Keep the rule list in sync with YCM2 when updating.
 */
export const config = {
  $schema: './node_modules/oxlint/configuration_schema.json',
  plugins: ['unicorn', 'typescript', 'oxc', 'react', 'jsx-a11y', 'vitest', 'promise', 'import'],
  categories: {
    correctness: 'deny',
    suspicious: 'deny',
    perf: 'deny',
  },
  /*
   * Severity policy: `correctness` + `suspicious` + `perf` are the deny baseline (via categories),
   * plus a curated deny list from pedantic/style/restriction (incl. type-aware rules).
   * Each rule is either deny (enforce) or off (ignore); off rules are annotated inline with the reason.
   * The only remaining `warn` exception is type-aware no-deprecated (informational nudge).
   * When an oxlint update adds new `suspicious` rules and they start failing, review and either fix or
   * set them off explicitly. Type-aware rules require `oxlint --type-aware` (oxlint-tsgolint),
   * already used by package lint scripts.
   */
  options: {
    typeAware: true,
  },
  rules: {
    // --- ESLint core ---
    'arrow-body-style': 'deny',
    'block-scoped-var': 'deny',
    eqeqeq: ['deny', 'always', { null: 'never' }],
    'no-console': 'deny',
    'no-extend-native': 'deny',
    'no-extra-bind': 'deny',
    'no-implied-eval': 'off', // superseded by the type-aware `typescript/no-implied-eval`
    'no-new': 'deny',
    'no-param-reassign': 'deny',
    'no-shadow': 'deny',
    'no-undef': 'deny',
    'no-unexpected-multiline': 'deny',
    'no-unmodified-loop-condition': 'deny',
    'no-unneeded-ternary': 'deny',
    'no-var': 'deny',
    'object-shorthand': 'deny',
    'prefer-const': 'deny',
    'prefer-destructuring': 'deny',
    'prefer-template': 'deny',
    'require-await': 'deny',
    'no-underscore-dangle': 'off', // underscore prefixes are intentionally allowed

    // --- TypeScript (syntax-only) ---
    'typescript/no-confusing-non-null-assertion': 'deny',
    'typescript/no-explicit-any': 'deny',
    'typescript/no-extraneous-class': 'deny',
    'typescript/no-inferrable-types': 'deny',
    'typescript/no-unnecessary-type-constraint': 'deny',

    // --- TypeScript (type-aware, via oxlint-tsgolint; needs `oxlint --type-aware`) ---
    // Async & promises
    'typescript/await-thenable': 'deny',
    'typescript/no-floating-promises': 'deny',
    'typescript/no-misused-promises': 'deny',
    'typescript/return-await': 'deny',
    'typescript/use-unknown-in-catch-callback-variable': 'deny',
    'typescript/promise-function-async': 'off', // opinionated: don't force `async` on every promise-returning fn
    'typescript/require-await': 'off', // covered by the non-type-aware `require-await`
    // Errors & throwing
    'typescript/no-implied-eval': 'deny',
    'typescript/only-throw-error': [
      'deny',
      { allow: [{ from: 'package', name: 'Redirect', package: '@tanstack/router-core' }] },
    ], // allow framework control-flow `throw redirect(...)` (tanstack Redirect = Response, not Error); rethrowing unknown/any is allowed by rule defaults
    'typescript/prefer-promise-reject-errors': 'deny',
    // Correctness & misuse
    'typescript/no-array-delete': 'deny',
    'typescript/no-base-to-string': 'deny',
    'typescript/no-for-in-array': 'deny',
    'typescript/no-meaningless-void-operator': 'deny',
    'typescript/no-misused-spread': 'deny',
    'typescript/no-mixed-enums': 'deny',
    'typescript/no-unsafe-unary-minus': 'deny',
    'typescript/no-useless-default-assignment': 'deny',
    'typescript/related-getter-setter-pairs': 'deny',
    'typescript/require-array-sort-compare': 'deny',
    'typescript/switch-exhaustiveness-check': 'deny',
    // Type-system hygiene (redundant / unnecessary)
    'typescript/consistent-return': 'deny',
    'typescript/consistent-type-exports': 'deny',
    'typescript/no-duplicate-type-constituents': 'deny',
    'typescript/no-redundant-type-constituents': 'deny',
    'typescript/no-unnecessary-boolean-literal-compare': 'deny',
    'typescript/no-unnecessary-condition': 'deny', // nursery rule
    'typescript/no-unnecessary-qualifier': 'deny',
    'typescript/no-unnecessary-template-expression': 'deny',
    'typescript/no-unnecessary-type-arguments': 'deny',
    'typescript/no-unnecessary-type-assertion': 'deny',
    'typescript/no-unnecessary-type-conversion': 'deny',
    'typescript/no-unsafe-enum-comparison': 'deny',
    'typescript/non-nullable-type-assertion-style': 'deny',
    'typescript/no-confusing-void-expression': 'off', // allow void-returning calls as expressions, e.g. `return res.end()`
    // Value & string restrictions
    'typescript/restrict-plus-operands': 'deny',
    'typescript/restrict-template-expressions': 'deny',
    // Modernization (prefer-*)
    'typescript/dot-notation': 'deny',
    'typescript/prefer-find': 'deny',
    'typescript/prefer-includes': 'deny',
    'typescript/prefer-optional-chain': 'deny', // nursery rule
    'typescript/prefer-readonly': 'deny',
    'typescript/prefer-reduce-type-parameter': 'deny',
    'typescript/prefer-regexp-exec': 'deny',
    'typescript/prefer-return-this-type': 'deny',
    'typescript/prefer-string-starts-ends-with': 'deny',
    'typescript/prefer-nullish-coalescing': ['deny', { ignorePrimitives: { boolean: true } }], // boolean `||` is correct OR-aggregation; still enforced for string/number falsy bugs
    // `any`-cascade: deny in src, off in specs (see overrides)
    'typescript/no-unsafe-argument': 'deny',
    'typescript/no-unsafe-assignment': 'deny',
    'typescript/no-unsafe-call': 'deny',
    'typescript/no-unsafe-member-access': 'deny',
    'typescript/no-unsafe-return': 'deny',
    // Off — deliberate patterns, or too opinionated/noisy
    'typescript/no-unnecessary-type-parameters': 'off', // idiomatic generic-return deserializers (cbor/redis/aes): unavoidable `unknown`-boundary cast
    'typescript/no-unsafe-type-assertion': 'off', // `as` assertions are used deliberately
    'typescript/unbound-method': 'off', // false positives when passing methods as callbacks, e.g. `arr.map(obj.fn)`
    'typescript/prefer-readonly-parameter-types': 'off', // impractical: 800+ sites, not a project goal
    'typescript/strict-boolean-expressions': 'off', // too opinionated/noisy (flags truthy checks like `if (str)`)
    'typescript/strict-void-return': 'off', // noisy
    'typescript/no-deprecated': 'warn', // informational: e.g. graphql `serialize()` removed in v18 (used in specs)

    // --- Unicorn ---
    // Correctness & safety
    'unicorn/consistent-assert': 'deny',
    'unicorn/consistent-date-clone': 'deny',
    'unicorn/error-message': 'deny',
    'unicorn/new-for-builtins': 'deny',
    'unicorn/no-abusive-eslint-disable': 'deny',
    'unicorn/no-accessor-recursion': 'deny',
    'unicorn/no-array-fill-with-reference-type': 'deny',
    'unicorn/no-array-method-this-argument': 'deny',
    'unicorn/no-immediate-mutation': 'deny',
    'unicorn/no-instanceof-array': 'deny',
    'unicorn/no-instanceof-builtins': 'deny',
    'unicorn/no-new-buffer': 'deny',
    'unicorn/no-object-as-default-parameter': 'deny',
    'unicorn/no-this-assignment': 'deny',
    'unicorn/no-typeof-undefined': 'deny',
    'unicorn/no-useless-collection-argument': 'deny',
    'unicorn/no-useless-error-capture-stack-trace': 'deny',
    'unicorn/no-useless-promise-resolve-reject': 'deny',
    'unicorn/no-useless-switch-case': 'deny',
    'unicorn/prefer-type-error': 'deny',
    'unicorn/throw-new-error': 'deny',
    // Arrays & length checks
    'unicorn/consistent-empty-array-spread': 'deny',
    'unicorn/consistent-existence-index-check': 'deny',
    'unicorn/explicit-length-check': 'deny',
    'unicorn/no-array-reverse': 'deny',
    'unicorn/no-array-sort': 'deny',
    'unicorn/no-length-as-slice-end': 'deny',
    'unicorn/no-magic-array-flat-depth': 'deny',
    'unicorn/no-unnecessary-array-flat-depth': 'deny',
    'unicorn/no-unnecessary-array-splice-count': 'deny',
    'unicorn/no-unnecessary-slice-end': 'deny',
    'unicorn/no-unreadable-array-destructuring': 'deny',
    'unicorn/require-array-join-separator': 'deny',
    // DOM & browser APIs
    'unicorn/no-document-cookie': 'deny',
    'unicorn/prefer-add-event-listener': 'deny',
    'unicorn/prefer-blob-reading-methods': 'deny',
    'unicorn/prefer-classlist-toggle': 'deny',
    'unicorn/prefer-dom-node-append': 'deny',
    'unicorn/prefer-dom-node-dataset': 'deny',
    'unicorn/prefer-dom-node-remove': 'deny',
    'unicorn/prefer-dom-node-text-content': 'deny',
    'unicorn/prefer-keyboard-event-key': 'deny',
    'unicorn/prefer-modern-dom-apis': 'deny',
    'unicorn/prefer-query-selector': 'deny',
    'unicorn/prefer-response-static-json': 'deny',
    'unicorn/relative-url-style': 'deny',
    'unicorn/require-post-message-target-origin': 'deny',
    // Modules & Node
    'unicorn/prefer-export-from': 'deny',
    'unicorn/prefer-global-this': 'deny',
    'unicorn/prefer-import-meta-properties': 'deny',
    'unicorn/prefer-node-protocol': 'deny',
    'unicorn/prefer-reflect-apply': 'deny',
    'unicorn/require-module-attributes': 'deny',
    'unicorn/require-module-specifiers': 'deny',
    // Modern JS APIs (prefer-*)
    'unicorn/prefer-array-flat': 'deny',
    'unicorn/prefer-array-index-of': 'deny',
    'unicorn/prefer-array-some': 'deny',
    'unicorn/prefer-at': 'deny',
    'unicorn/prefer-bigint-literals': 'deny',
    'unicorn/prefer-code-point': 'deny',
    'unicorn/prefer-date-now': 'deny',
    'unicorn/prefer-default-parameters': 'deny',
    'unicorn/prefer-includes': 'deny',
    'unicorn/prefer-math-min-max': 'deny',
    'unicorn/prefer-math-trunc': 'deny',
    'unicorn/prefer-modern-math-apis': 'deny',
    'unicorn/prefer-native-coercion-functions': 'deny',
    'unicorn/prefer-negative-index': 'deny',
    'unicorn/prefer-number-properties': 'deny',
    'unicorn/prefer-object-from-entries': 'deny',
    'unicorn/prefer-optional-catch-binding': 'deny',
    'unicorn/prefer-prototype-methods': 'deny',
    'unicorn/prefer-regexp-test': 'deny',
    'unicorn/prefer-single-call': 'deny',
    'unicorn/prefer-spread': 'deny',
    'unicorn/prefer-string-raw': 'deny',
    'unicorn/prefer-string-replace-all': 'deny',
    'unicorn/prefer-string-slice': 'deny',
    'unicorn/prefer-string-trim-start-end': 'deny',
    'unicorn/prefer-structured-clone': 'deny',
    // Readability & style
    'unicorn/catch-error-name': 'deny',
    'unicorn/no-await-expression-member': 'deny',
    'unicorn/no-lonely-if': 'deny',
    'unicorn/no-negation-in-equality-check': 'deny',
    'unicorn/no-static-only-class': 'deny',
    'unicorn/no-unreadable-iife': 'deny',
    'unicorn/prefer-class-fields': 'deny',
    'unicorn/prefer-logical-operator-over-ternary': 'deny',
    'unicorn/prefer-ternary': 'deny',
    'unicorn/require-number-to-fixed-digits-argument': 'deny',
    'unicorn/switch-case-braces': 'deny',
    'unicorn/switch-case-break-position': 'deny',
    // Formatting, casing & literals
    'unicorn/consistent-template-literal-escape': 'deny',
    'unicorn/empty-brace-spaces': 'deny',
    'unicorn/escape-case': 'deny',
    'unicorn/no-console-spaces': 'deny',
    'unicorn/no-hex-escape': 'deny',
    'unicorn/no-zero-fractions': 'deny',
    'unicorn/number-literal-case': 'off', // conflicts with oxfmt: rule wants 0xFF, oxfmt lowercases hex digits to 0xff
    'unicorn/numeric-separators-style': 'deny',
    'unicorn/text-encoding-identifier-case': 'deny',
    'unicorn/consistent-function-scoping': 'off', // would force hoisting nested helpers out of factories/closures

    // --- Import ---
    'import/no-cycle': 'deny',
    'import/no-duplicates': 'deny',
    'import/no-empty-named-blocks': 'deny',
    'import/no-self-import': 'deny',

    // --- React / React Hooks ---
    'react-hooks/rules-of-hooks': 'deny',
    'react/iframe-missing-sandbox': 'deny',
    'react/jsx-no-comment-textnodes': 'deny',
    'react/jsx-no-script-url': 'deny',
    'react/no-unstable-nested-components': 'deny',
    'react/style-prop-object': 'deny',
    'react-hooks/exhaustive-deps': 'deny',
    'react/react-in-jsx-scope': 'off', // new JSX transform (React 19), no React import needed

    // --- JSX a11y ---
    'jsx-a11y/alt-text': 'deny',
    'jsx-a11y/anchor-has-content': 'deny',
    'jsx-a11y/aria-props': 'deny',
    'jsx-a11y/aria-proptypes': 'deny',
    'jsx-a11y/aria-unsupported-elements': 'deny',
    'jsx-a11y/prefer-tag-over-role': 'deny',
    'jsx-a11y/role-has-required-aria-props': 'deny',
    'jsx-a11y/role-supports-aria-props': 'deny',
    'jsx-a11y/no-autofocus': 'off', // autofocus is intentionally allowed

    // --- Vitest ---
    'vitest/require-mock-type-parameters': 'off', // too noisy; would force type args everywhere, e.g. `vi.fn<T>()`
    'vitest/require-to-throw-message': 'off', // too noisy; `.toThrow()` without a message is fine

    // --- Promise ---
    'promise/no-multiple-resolved': 'deny',

    // --- Oxc ---
    'oxc/misrefactored-assign-op': 'deny',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'typescript/no-explicit-any': 'off',
        // mocks/`vi.fn()`/casts make `any`-cascade noise in tests; enforced in src
        'typescript/no-unsafe-argument': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-call': 'off',
        'typescript/no-unsafe-member-access': 'off',
        'typescript/no-unsafe-return': 'off',
      },
    },
  ],
  settings: {
    'jsx-a11y': {
      polymorphicPropName: null,
      components: {},
      attributes: {},
    },
    react: {
      version: '19',
      formComponents: [],
      linkComponents: [],
    },
  },
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  ignorePatterns: ['**/node_modules/**', '**/builds/**', '**/dist/**', '**/coverage/**', '**/routeTree.gen.ts'],
} as const;

export default config;
