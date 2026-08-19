import { BlogPost } from '../../types';
import { agentBehindEmulator } from './agent-behind-the-emulator';

// Individual post exports for direct access
export {
  agentBehindEmulator
};

/**
 * All published blog posts ordered chronologically
 * (Newest posts first)
 */
export const blogPostsData: BlogPost[] = [
  agentBehindEmulator
]

/**
 * Helper to retrieve a single blog post by its slug identifier
 */
export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPostsData.find((post) => post.slug === slug);
};

/**
 * Helper to retrieve all featured posts
 */
export const getFeaturedPosts = (): BlogPost[] => {
  return blogPostsData.filter((post) => post.featured);
};
