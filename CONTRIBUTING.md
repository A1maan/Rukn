# Contributing to Rukn

Thank you for your interest in contributing to the Rukn - NCMH Mental Health Feedback Analysis Platform! We welcome contributions from the community to help improve mental health support services.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

---

## 🤝 Code of Conduct

This project is dedicated to providing a welcoming and inclusive environment for everyone. By participating, you are expected to uphold this commitment:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community and mental health support
- Show empathy towards other community members

### Mental Health Sensitivity

Given the nature of this project, please be especially mindful when:
- Discussing crisis scenarios or sensitive topics
- Handling user data (always maintain privacy and confidentiality)
- Testing with real or realistic mental health content

---

## 🛠️ How Can I Contribute?

### 1. **Reporting Bugs**

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- Clear and descriptive title
- Steps to reproduce the behavior
- Expected vs actual behavior
- Screenshots/logs if applicable
- Your environment (OS, Node version, Python version, etc.)

### 2. **Suggesting Enhancements**

We welcome feature suggestions! Please provide:
- Clear use case and problem statement
- Detailed description of the proposed solution
- Any alternative solutions considered
- How it benefits mental health support services

### 3. **Code Contributions**

We accept contributions for:
- Bug fixes
- Feature implementations
- Documentation improvements
- Test coverage
- Performance optimizations
- Accessibility improvements
- Internationalization (RTL support, translations)

---

## 💻 Development Setup

### Prerequisites

- Node.js 20+ & npm
- Python 3.12+
- Git & **Git LFS** (required for model weights)
- Supabase account (for database)

### Install Git LFS

Before cloning, ensure Git LFS is installed to properly download model files:

**macOS:**
```bash
brew install git-lfs
git lfs install
```

**Ubuntu/Debian:**
```bash
sudo apt-get install git-lfs
git lfs install
```

**Windows:**
1. Download from [git-lfs.github.com](https://git-lfs.github.com/)
2. Install and run: `git lfs install`

**Verify:**
```bash
git lfs version
```

### Clone the Repository

```bash
# Clone with LFS
git clone https://github.com/A1maan/Rukn.git
cd Rukn

# Verify model files downloaded correctly
git lfs ls-files
# Should show .pt files in backend/models/
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the backend
python -m app.main
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 📝 Coding Guidelines

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Document functions with docstrings
- Keep functions focused and under 50 lines when possible
- Use meaningful variable names (prefer `urgency_score` over `us`)

**Example:**
```python
def analyze_urgency(text: str) -> dict:
    """
    Analyze urgency level of Arabic mental health text.
    
    Args:
        text: Input text in Arabic
        
    Returns:
        dict: Contains urgency level and confidence score
    """
    # Implementation
    pass
```

### TypeScript/React (Frontend)

- Use TypeScript strict mode
- Follow React best practices (hooks, functional components)
- Use meaningful component and variable names
- Keep components under 300 lines (split if larger)
- Extract reusable logic into custom hooks
- Use Tailwind CSS for styling (avoid inline styles)

**Example:**
```typescript
interface AnalysisResult {
  urgency: UrgencyLevel;
  emotion: Emotion;
  confidence: number;
}

function useAnalysis(text: string): AnalysisResult | null {
  // Implementation
}
```

### Accessibility

- Include ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA minimum)
- Support screen readers
- Test with Arabic RTL layout

### Internationalization

- Use i18next for all user-facing text
- Support both Arabic (RTL) and English (LTR)
- Extract all strings to translation files
- Test layouts in both directions

---

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

### Examples

```bash
feat(dashboard): add real-time alert notifications

fix(backend): correct emotion mapping for Arabic text

docs(readme): update setup instructions for Supabase

style(frontend): format code with prettier

refactor(api): simplify aggregation logic

test(analysis): add unit tests for urgency classifier
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test thoroughly**
   ```bash
   # Backend
   pytest
   
   # Frontend
   npm test
   npm run build  # Ensure it builds
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

### Submitting the PR

1. Push your branch
   ```bash
   git push origin feat/your-feature-name
   ```

2. Create Pull Request on GitHub with:
   - Clear title following commit convention
   - Description of changes
   - Related issue number (if applicable)
   - Screenshots/GIFs for UI changes
   - Checklist completed:
     - [ ] Code follows style guidelines
     - [ ] Tests added/updated
     - [ ] Documentation updated
     - [ ] No breaking changes (or documented)
     - [ ] Tested in both Arabic and English

3. **Review Process**
   - At least one maintainer must approve
   - All CI checks must pass
   - Address review comments promptly
   - Keep PR updated with main branch

4. **After Merge**
   - Delete your feature branch
   - Close related issues

---

## 🐛 Reporting Bugs

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities. Instead:
- Email security concerns to: [security email]
- Include detailed description and steps to reproduce
- Wait for response before public disclosure

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows, Ubuntu]
- Browser: [e.g., Chrome, Safari]
- Node version: [e.g., 20.1.0]
- Python version: [e.g., 3.12.0]

**Additional context**
Any other relevant information.
```

---

## 💡 Suggesting Enhancements

### Enhancement Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Impact on Mental Health Support**
How this enhancement improves mental health services.

**Additional context**
Screenshots, mockups, or examples.
```

---

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: Urgent issue
- `priority: medium`: Important issue
- `priority: low`: Nice to have
- `backend`: Backend related
- `frontend`: Frontend related
- `ml/ai`: Machine learning related
- `i18n`: Internationalization
- `a11y`: Accessibility

---

## 🌍 Translation Contributions

We welcome help translating the platform! 

Currently supported:
- Arabic (ar) - Primary
- English (en) - Primary

To add translations:
1. Copy `frontend/locales/en.json` to your language code
2. Translate all strings
3. Test RTL layout if applicable
4. Submit PR with translation file

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [PyTorch](https://pytorch.org/docs)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)

---

## 📞 Getting Help

- 💬 **Discord**: [Join our community] (if available)
- 📧 **Email**: [contact email]
- 🐛 **Issues**: [GitHub Issues](https://github.com/A1maan/Rukn/issues)
- 📖 **Docs**: [Project Wiki](https://github.com/A1maan/Rukn/wiki)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under:
- **Code**: MIT License (see LICENSE file)
- **Documentation**: CC BY 4.0 (see LICENSE-DOCS file)

---

## 🙏 Thank You

Your contributions help improve mental health support services and make a real difference in people's lives. Thank you for being part of this mission!

---