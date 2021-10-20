// 参考：https://raw.githubusercontent.com/commitizen/cz-conventional-changelog/master/engine.js
const types = [
  {
    name: 'feat',
    description: '新功能',
    title: 'Features',
    emoji: '✨',
  },
  {
    name: 'wip',
    description: 'Work in progress',
    title: 'wip',
    emoji: '👨‍💻',
  },
  {
    name: 'fix',
    description: 'Bug 修复',
    title: 'Bug Fixes',
    emoji: '🐛',
  },
  {
    name: 'docs',
    description: '文档修改',
    title: 'Documentation',
    emoji: '📚',
  },
  {
    name: 'style',
    description: '代码格式修改',
    title: 'Styles',
    emoji: '💎',
  },
  {
    name: 'refactor',
    description: '代码重构',
    title: 'Code Refactoring',
    emoji: '📦',
  },
  {
    name: 'perf',
    description: '性能优化',
    title: 'Performance Improvements',
    emoji: '🚀',
  },
  {
    name: 'test',
    description: '测试代码修改',
    title: 'Tests',
    emoji: '🚨',
  },
  {
    name: 'build',
    description: '构建相关修改',
    title: 'Builds',
    emoji: '🛠',
  },
  {
    name: 'ci',
    description: 'CI 调整',
    title: 'Continuous Integrations',
    emoji: '⚙️',
  },
  {
    name: 'chore',
    description: '其他不影响源码的修改',
    title: 'Chores',
    emoji: '♻️',
  },
  {
    name: 'revert',
    description: 'Reverts a previous commit',
    title: 'Reverts',
    emoji: '🗑',
  },
]
const filter = (array) => {
  return array.filter((x) => x)
}

function czEngine() {
  const choices = types.map((type) => ({
    name: `${type.emoji}  ${type.name}: ${type.description}`,
    value: type.name,
  }))

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function (cz, commit) {
      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'commit 类型',
          choices: choices,
          default: 'feat',
        },
        // 暂时没有啥用
        // {
        //   type: 'input',
        //   name: 'scope',
        //   message:
        //     'What is the scope of this change (e.g. component or file name): (press enter to skip)',
        //   filter: (value) => value.trim(),
        // },
        {
          type: 'input',
          name: 'subject',
          message: '提交简短描述',
          // 至少写4个字符
          validate: (subject) => {
            if (subject.length < 4) {
              return '怎么也得写4个字吧？'
            }
            return true
          },
        },
        {
          type: 'confirm',
          name: 'isBreaking',
          message: '是否有破坏性修改',
          default: false,
        },
        {
          type: 'input',
          name: 'breakingBody',
          default: '-',
          message:
            'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself:\n',
          when: function (answers) {
            return answers.isBreaking && !answers.body
          },
          validate: function (breakingBody, answers) {
            return breakingBody.trim().length > 0 || 'Body is required for BREAKING CHANGE'
          },
        },
        {
          type: 'input',
          name: 'breaking',
          message: 'Describe the breaking changes:\n',
          when: function (answers) {
            return answers.isBreaking
          },
        },

        // issue 相关的先不要
        // {
        //   type: 'confirm',
        //   name: 'isIssueAffected',
        //   message: 'Does this change affect any open issues?',
        //   default: false,
        // },
        // {
        //   type: 'input',
        //   name: 'issuesBody',
        //   default: '-',
        //   message:
        //     'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself:\n',
        //   when: function (answers) {
        //     return answers.isIssueAffected && !answers.body && !answers.breakingBody
        //   },
        // },
        // {
        //   type: 'input',
        //   name: 'issues',
        //   message: 'Add issue references (e.g. "fix #123", "re #123".):\n',
        //   when: function (answers) {
        //     return answers.isIssueAffected
        //   },
        //   default: undefined,
        // },
      ]).then((answers) => {
        // parentheses are only needed when a scope is present
        const scope = answers.scope ? `(${answers.scope})` : ''

        // Hard limit this line in the validate
        const head = `${answers.type}${scope}: ${answers.subject}`

        // Wrap these lines at options.maxLineWidth characters
        const body = answers.body ? answers.body : false

        // Apply breaking change prefix, removing it if already present
        let breaking = answers.breaking ? answers.breaking.trim() : ''
        breaking = breaking ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '') : ''
        breaking = breaking ? breaking : false

        const issues = answers.issues ? answers.issues : false

        commit(filter([head, body, breaking, issues]).join('\n\n'))
      })
    },
  }
}

module.exports = czEngine()
