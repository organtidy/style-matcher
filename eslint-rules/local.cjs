module.exports = {
  rules: {
    "max-file-lines": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Enforce maximum line count per file",
        },
        schema: [
          {
            type: "object",
            properties: {
              max: { type: "integer", minimum: 1 },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const filename = context.filename || (context.getFilename ? context.getFilename() : "");
        const basename = filename ? filename.split(/[/\\]/).pop() : "";

        // Skip declaration files & common barrel files
        if (
          !filename ||
          filename.endsWith(".d.ts") ||
          /^index\.[jt]sx?$/.test(basename) ||
          /^types\.[jt]sx?$/.test(basename) ||
          /^constants\.[jt]sx?$/.test(basename)
        ) {
          return {};
        }

        return {
          Program(node) {
            const options = context.options[0] || {};
            const max = options.max || 350;
            const sourceCode = context.sourceCode || context.getSourceCode();
            const lines = sourceCode.lines || [];
            if (lines.length > max) {
              context.report({
                node,
                message: `File length of ${lines.length} lines exceeds maximum allowed ceiling of ${max} lines.`,
              });
            }
          },
        };
      },
    },
    "no-direct-console": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow direct console logging in application code",
        },
        schema: [],
      },
      create(context) {
        return {
          MemberExpression(node) {
            if (
              node.object &&
              node.object.type === "Identifier" &&
              node.object.name === "console"
            ) {
              context.report({
                node,
                message: "Direct console usage is disallowed in production application code. Use a structured logger instead.",
              });
            }
          },
        };
      },
    },
  },
};
