export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^([a-z]+):\s(.+?)\s\(#(\d+)\)$/,
      headerCorrespondence: ['type', 'subject', 'issue'],
    },
  },
  rules: {
    'header-max-length': [2, 'always', 72],
    'type-enum': [2, 'always', ['feature', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
  },
};
