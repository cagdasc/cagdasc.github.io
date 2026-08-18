import { BlogPost } from '../../types';

/**
 * TEMPLATE FOR CREATING A NEW BLOG POST
 * 
 * Instructions:
 * 1. Copy this template file to a new file (e.g. `src/data/posts/post6-my-article.ts`)
 * 2. Fill in the fields below
 * 3. Import and add your new post to `src/data/posts/index.ts`
 */
export const templatePost: BlogPost = {
  id: '6',
  slug: 'my-new-article-slug',
  title: 'Your Article Title Here',
  summary: 'A concise 1-2 sentence overview of what readers will learn from this article.',
  publishedAt: 'March 15, 2026',
  readTime: '5 min read',
  category: 'Architecture', // e.g. 'Testing & Tooling', 'Architecture', 'Kotlin Multiplatform', 'CI/CD & DevOps'
  tags: ['Jetpack Compose', 'Kotlin', 'Android'],
  featured: false,
  content: `Write your markdown content here.

## Heading 1

Your article paragraphs...

\`\`\`kotlin
fun helloWorld() {
    println("Hello!")
}
\`\`\`
`
};
