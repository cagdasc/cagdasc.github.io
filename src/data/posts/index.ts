import { BlogPost } from '../../types';
import { post1ScreenshotTesting } from './post1-screenshot-testing';
import { post2BackPresses } from './post2-back-presses';
import { post3KmpFoundations } from './post3-kmp-foundations';
import { post4MobileCicd } from './post4-mobile-cicd';
import { post5FintechUdf } from './post5-fintech-udf';

// Individual post exports for direct access
export {
  post1ScreenshotTesting,
  post2BackPresses,
  post3KmpFoundations,
  post4MobileCicd,
  post5FintechUdf,
};

/**
 * All published blog posts ordered chronologically
 * (Newest posts first)
 */
/*
export const blogPostsData: BlogPost[] = [
  post1ScreenshotTesting,
  post2BackPresses,
  post3KmpFoundations,
  post4MobileCicd,
  post5FintechUdf,
];
*/
export const blogPostsData: BlogPost[] = []

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
