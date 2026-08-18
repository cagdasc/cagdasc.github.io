import { BlogPost } from '../../types';

export const post4MobileCicd: BlogPost = {
  id: '4',
  slug: 'supercharging-mobile-ci-cd-fastlane-github-actions-gradle-cache',
  title: 'Supercharging Mobile CI/CD: Fastlane, GitHub Actions, and Remote Gradle Build Cache',
  summary: 'Step-by-step optimization techniques that slashed our Android CI pull request build times from 24 minutes to under 4 minutes using distributed cache and smart test sharding.',
  publishedAt: 'March 30, 2025',
  readTime: '6 min read',
  category: 'CI/CD & DevOps',
  tags: ['GitHub Actions', 'Gradle Build Cache', 'Fastlane', 'DevOps', 'Build Speed'],
  featured: false,
  content: `Slow CI pipelines destroy developer productivity and context switching. In large Android multi-module projects, waiting 20 to 30 minutes for a lint check and unit test run slows down the entire delivery cycle.

Here is how we optimized our Android CI workflow to run under 4 minutes on GitHub Actions.

---

## 1. Remote Gradle Build Cache

Local Gradle caching only benefits the machine running the build. By enabling a secure remote HTTP build cache, every CI runner can reuse task outputs (compilation, dexing, linting, KSP generation) produced by previous runs or local builds.

\`\`\`kotlin
// settings.gradle.kts
buildCache {
    local {
        isEnabled = true
    }
    remote<HttpBuildCache> {
        url = uri("https://gradle-cache.internal.domain/cache/")
        isPush = System.getenv("CI") != null
        credentials {
            username = System.getenv("GRADLE_CACHE_USER")
            password = System.getenv("GRADLE_CACHE_PASSWORD")
        }
    }
}
\`\`\`

---

## 2. GitHub Actions Dependency Caching

Ensure that Gradle wrapper and cache directories are preserved across runner instances with granular action caches.

---

## 3. Parallel Sharding of Screenshot and Unit Tests

Instead of running all 400+ unit and screenshot tests sequentially on a single runner, shard tasks across parallel virtual machines in GitHub Actions.

---

## Results and Metrics

- **Full PR Verification Time**: Reduced from 24 min 15 sec to 3 min 45 sec.
- **Gradle Cache Hit Rate**: Increased from ~18% to ~89%.
- **CI Cost Savings**: 65% reduction in billable runner minutes.
- **Developer Satisfaction**: Improved from 3.2 to 4.8 / 5.0.`
};
