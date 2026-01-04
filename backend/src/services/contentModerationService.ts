import logger from '../utils/logger';
import { detectMaliciousContent } from '../utils/sanitization';

/**
 * Content Moderation Service
 * Handles moderation of user-generated content to prevent inappropriate content
 */

// List of inappropriate words and phrases (can be expanded)
const INAPPROPRIATE_WORDS = [
  // Profanity (basic list - should be expanded based on requirements)
  'damn', 'hell', 'shit', 'ass', 'bastard', 'bitch', 'crap', 'dick', 'piss', 'tits',
  
  // Hate speech indicators
  'hate', 'kill', 'murder', 'terrorist', 'nazi', 'racist',
  
  // Spam indicators
  'click here', 'buy now', 'free money', 'winner', 'congratulations', 'claim now',
  
  // Inappropriate content for wedding platform
  'divorce', 'breakup', 'cheating', 'affair', 'scam'
];

// Spam patterns
const SPAM_PATTERNS = [
  /(\w+)\1{3,}/, // Repeated characters (e.g., "aaaaaa")
  /[A-Z]{5,}/, // Excessive capitalization
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, // URLs
  /\b\d{3,}\b/, // Numbers with 3+ digits (potential phone numbers)
  /[!@#$%^&*]{3,}/, // Excessive special characters
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /url\s*\(/i,
  /@import/i,
  /vbscript:/i,
  /data:text\/html/i,
];

/**
 * Moderation result interface
 */
export interface ModerationResult {
  isApproved: boolean;
  reason?: string;
  score: number; // 0-100, higher is more suspicious
  categories: {
    profanity: boolean;
    spam: boolean;
    malicious: boolean;
    inappropriate: boolean;
  };
}

/**
 * Content Moderation Service Class
 */
class ContentModerationService {
  /**
   * Analyze text content for inappropriate material
   * @param content - Text content to analyze
   * @returns Moderation result
   */
  analyzeContent(content: string): ModerationResult {
    if (typeof content !== 'string' || !content.trim()) {
      return {
        isApproved: true,
        score: 0,
        categories: {
          profanity: false,
          spam: false,
          malicious: false,
          inappropriate: false
        }
      };
    }

    const lowerContent = content.toLowerCase();
    let score = 0;
    const categories = {
      profanity: false,
      spam: false,
      malicious: false,
      inappropriate: false
    };

    // Check for malicious content first (highest priority)
    if (detectMaliciousContent(content)) {
      categories.malicious = true;
      score += 80;
    }

    // Check for inappropriate words
    const foundInappropriateWords = INAPPROPRIATE_WORDS.filter(word => 
      lowerContent.includes(word)
    );
    
    if (foundInappropriateWords.length > 0) {
      categories.inappropriate = true;
      categories.profanity = true;
      score += foundInappropriateWords.length * 15;
    }

    // Check for spam patterns
    const matchedSpamPatterns = SPAM_PATTERNS.filter(pattern => 
      pattern.test(content)
    );
    
    if (matchedSpamPatterns.length > 0) {
      categories.spam = true;
      score += matchedSpamPatterns.length * 20;
    }

    // Check for suspicious patterns
    const matchedSuspiciousPatterns = SUSPICIOUS_PATTERNS.filter(pattern => 
      pattern.test(content)
    );
    
    if (matchedSuspiciousPatterns.length > 0) {
      score += matchedSuspiciousPatterns.length * 25;
    }

    // Additional checks
    score += this.checkExcessiveCapitalization(content);
    score += this.checkRepeatingPhrases(content);
    score += this.checkLengthIssues(content);

    // Normalize score to 0-100
    score = Math.min(100, score);

    // Determine if content is approved
    const isApproved = score < 50; // Threshold can be adjusted
    let reason: string | undefined;

    if (!isApproved) {
      if (categories.malicious) {
        reason = 'Content contains potentially malicious code or scripts';
      } else if (categories.profanity) {
        reason = 'Content contains inappropriate language';
      } else if (categories.spam) {
        reason = 'Content appears to be spam';
      } else {
        reason = 'Content does not meet community guidelines';
      }
    }

    return {
      isApproved,
      reason,
      score,
      categories
    };
  }

  /**
   * Check for excessive capitalization
   * @param content - Text content
   * @returns Score penalty
   */
  private checkExcessiveCapitalization(content: string): number {
    if (content.length < 10) return 0;
    
    const uppercaseCount = (content.match(/[A-Z]/g) || []).length;
    const totalLetters = (content.match(/[a-zA-Z]/g) || []).length;
    
    if (totalLetters === 0) return 0;
    
    const uppercasePercentage = (uppercaseCount / totalLetters) * 100;
    
    // Penalize if more than 50% uppercase
    return uppercasePercentage > 50 ? 15 : 0;
  }

  /**
   * Check for repeating phrases or characters
   * @param content - Text content
   * @returns Score penalty
   */
  private checkRepeatingPhrases(content: string): number {
    let penalty = 0;
    
    // Check for repeated words
    const words = content.toLowerCase().split(/\s+/);
    const wordCounts: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Only check words longer than 3 characters
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    // Penalize words that appear more than 3 times
    Object.values(wordCounts).forEach(count => {
      if (count > 3) {
        penalty += 5;
      }
    });
    
    return penalty;
  }

  /**
   * Check for length issues (too short or too long)
   * @param content - Text content
   * @returns Score penalty
   */
  private checkLengthIssues(content: string): number {
    const length = content.trim().length;
    
    // Very short content might be spam
    if (length < 3 && length > 0) {
      return 10;
    }
    
    // Very long content might be spam
    if (length > 1000) {
      return 10;
    }
    
    return 0;
  }

  /**
   * Moderate guest name (more strict than general content)
   * @param name - Guest name
   * @returns Moderation result
   */
  moderateGuestName(name: string): ModerationResult {
    const result = this.analyzeContent(name);
    
    // Additional checks for names
    if (name.length < 2 || name.length > 50) {
      result.isApproved = false;
      result.reason = result.reason || 'Name length is invalid';
      result.score += 20;
    }
    
    // Names should not contain numbers or special characters (except hyphens and apostrophes)
    if (!/^[a-zA-Z\s'\-]+$/.test(name)) {
      result.isApproved = false;
      result.reason = result.reason || 'Name contains invalid characters';
      result.score += 30;
    }
    
    return result;
  }

  /**
   * Moderate RSVP message
   * @param message - RSVP message
   * @returns Moderation result
   */
  moderateRSVPMessage(message: string): ModerationResult {
    const result = this.analyzeContent(message);
    
    // RSVP messages have specific length constraints
    if (message && (message.length < 5 || message.length > 500)) {
      result.isApproved = false;
      result.reason = result.reason || 'Message length is invalid (must be 5-500 characters)';
      result.score += 15;
    }
    
    return result;
  }

  /**
   * Moderate guest wish message
   * @param wish - Guest wish message
   * @returns Moderation result
   */
  moderateGuestWish(wish: string): ModerationResult {
    const result = this.analyzeContent(wish);
    
    // Guest wishes have specific length constraints
    if (wish.length < 10 || wish.length > 300) {
      result.isApproved = false;
      result.reason = result.reason || 'Wish length is invalid (must be 10-300 characters)';
      result.score += 15;
    }
    
    return result;
  }

  /**
   * Log moderation decision for monitoring
   * @param content - Content that was moderated
   * @param result - Moderation result
   * @param userId - User ID if available
   */
  logModerationDecision(content: string, result: ModerationResult, userId?: string): void {
    const logData = {
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''), // Truncate for privacy
      isApproved: result.isApproved,
      reason: result.reason,
      score: result.score,
      categories: result.categories,
      userId,
      timestamp: new Date().toISOString(),
    };

    if (!result.isApproved) {
      logger.warn('Content moderation: rejected', logData);
    } else if (result.score > 20) {
      logger.info('Content moderation: approved with warnings', logData);
    }
  }
}

export default new ContentModerationService();