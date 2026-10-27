const STORAGE_KEY = 'asteroid_through_time_best_score_years';

export class BestScoreStorage {
  /**
   * Retrieves the current best score in years. Returns 0 if unset or invalid.
   */
  public static getBestScore(): number {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return 0;
      }
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } catch {
      return 0;
    }
  }

  /**
   * Saves a new score if it exceeds the current best.
   * Returns true if a new high score was set.
   */
  public static saveBestScore(newScore: number): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const validScore = Math.max(0, Math.floor(newScore || 0));
      const currentBest = this.getBestScore();
      if (validScore > currentBest) {
        window.localStorage.setItem(STORAGE_KEY, validScore.toString());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Clears the best score (for testing or reset)
   */
  public static clearBestScore(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }
}
