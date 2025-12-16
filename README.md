# CopilotHub

A curated collection of prompts, instructions, agents, tools, and MCP servers for AI-powered development.

## 🚀 Features

- **Curated Prompts**: Browse and submit AI prompts for code review, documentation, debugging, and more
- **Instructions**: Coding standards and best practices for specific file patterns or languages
- **AI Agents**: Specialized AI agents for specific development tasks or domains
- **Tools & MCPs**: Development tools, extensions, and MCP servers that enhance AI-powered workflows
- **Community Voting**: Upvote and downvote content to surface the best resources

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, set up your environment variables and run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

> **For developers**: See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions, project structure, and technical documentation.

## 🤝 Contributing

Contributions are welcome! CopilotHub uses a GitHub-based contribution model. All content submissions are made through pull requests.

### How to Contribute

#### 1. Fork the Repository

Start by forking the [CopilotHub repository](https://github.com/eddybenchek/copilothub) on GitHub.

#### 2. Adding New Content

If you want to submit **new prompts or instructions** that don't already exist:

1. **Fork and Clone**: Fork the repository and clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/copilothub.git
   cd copilothub
   ```

2. **Create a Branch**: Create a new branch for your contribution
   ```bash
   git checkout -b add-my-prompt
   ```

3. **Add Your Content**: 
   - Submit through the web interface at `/submit` (recommended), or
   - Add content directly via GitHub PR following the repository structure
   - Ensure your content is tested and works as expected

4. **Required Fields**: Make sure to include:
   - **title**: Clear, descriptive title
   - **description**: Brief explanation of the content
   - **content**: The actual prompt or instruction text
   - **tags**: Relevant categories (e.g., `["JavaScript", "React"]`)
   - **difficulty**: `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`

5. **Test Your Content**: Before submitting, ensure that your prompts have been tested and work as expected. This ensures that other developers can rely on your contributions.

#### 3. Adding to Existing Content

If you want to improve or expand existing prompts or instructions:

1. Find the existing content in the repository
2. Make your improvements or additions
3. Submit a PR with a clear description of your changes
4. Test your changes before submitting

#### 4. Create a Pull Request

Commit your changes and push to your fork, then create a pull request with:

- A clear, descriptive title
- Detailed description of what you're adding or improving
- Any relevant context or testing notes

```bash
git commit -m "Add: My awesome prompt"
git push origin add-my-prompt
```

#### 5. Review Process

Our team will review your pull request. We may request changes or ask questions. Once approved, your contribution will be merged and appear on CopilotHub!

### Contribution Guidelines

- **Prompts & Instructions**: Free to contribute! No fees required.
- **Agents, Tools & MCPs**: Paid contributions required. Contact us for details.
- **Quality Standards**: 
  - Well-documented and tested content
  - Clear, descriptive titles and descriptions
  - Proper categorization and tagging
  - Original or properly attributed content

For more detailed guidelines, see our [Contribution Guidelines](/rules) page.

## 📄 License

This project is open source.

## 🙏 Acknowledgments

- Content from [awesome-copilot](https://github.com/github/awesome-copilot) (MIT License)
- Built with amazing open-source tools

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.
