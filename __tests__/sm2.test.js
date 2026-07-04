import { describe, it, expect, vi } from "vitest";
import { calculateNextReview, getDueWords, getDueWordsCount } from "../lib/sm2.js";

describe("SM-2 Algorithm", () => {
  describe("calculateNextReview", () => {
    it("should set interval to 1 for first correct answer (quality >= 3)", () => {
      const word = { repetitions: 0, easeFactor: 2.5, interval: 0 };
      const result = calculateNextReview(word, 3);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });

    it("should set interval to 6 for second correct answer", () => {
      const word = { repetitions: 1, easeFactor: 2.5, interval: 1 };
      const result = calculateNextReview(word, 3);
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it("should multiply interval by ease factor for 3rd+ correct answer", () => {
      const word = { repetitions: 2, easeFactor: 2.5, interval: 6 };
      const result = calculateNextReview(word, 3);
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
    });

    it("should reset repetitions on incorrect answer (quality < 3)", () => {
      const word = { repetitions: 5, easeFactor: 2.5, interval: 30 };
      const result = calculateNextReview(word, 1);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it("should update ease factor based on quality", () => {
      const word = { repetitions: 2, easeFactor: 2.5, interval: 6 };
      const result = calculateNextReview(word, 5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it("should decrease ease factor for low quality", () => {
      const word = { repetitions: 2, easeFactor: 2.5, interval: 6 };
      const result = calculateNextReview(word, 1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it("should not let ease factor go below 1.3", () => {
      const word = { repetitions: 0, easeFactor: 1.3, interval: 0 };
      const result = calculateNextReview(word, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("should not let ease factor exceed 3.0", () => {
      const word = { repetitions: 0, easeFactor: 3.0, interval: 0 };
      const result = calculateNextReview(word, 5);
      expect(result.easeFactor).toBeLessThanOrEqual(3.0);
    });

    it("should set mastery level correctly", () => {
      const word = { repetitions: 7, easeFactor: 2.5, interval: 30 };
      const result = calculateNextReview(word, 5);
      expect(result.masteryLevel).toBe(100);
      expect(result.mastery).toBe("C2");
    });

    it("should handle default values", () => {
      const result = calculateNextReview({}, 3);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
    });
  });

  describe("getDueWords", () => {
    it("should return words with no nextReview date", () => {
      const vocab = [
        { id: "1", word: "test", nextReview: null },
        { id: "2", word: "hello", nextReview: "2099-01-01" },
      ];
      const due = getDueWords(vocab);
      expect(due.length).toBe(1);
      expect(due[0].id).toBe("1");
    });

    it("should return words with past nextReview date", () => {
      const vocab = [
        { id: "1", word: "past", nextReview: "2020-01-01" },
        { id: "2", word: "future", nextReview: "2099-01-01" },
      ];
      const due = getDueWords(vocab);
      expect(due.length).toBe(1);
      expect(due[0].id).toBe("1");
    });

    it("should return empty for no due words", () => {
      const vocab = [{ id: "1", word: "future", nextReview: "2099-01-01" }];
      const due = getDueWords(vocab);
      expect(due.length).toBe(0);
    });
  });

  describe("getDueWordsCount", () => {
    it("should count due words correctly", () => {
      const vocab = [
        { id: "1", nextReview: null },
        { id: "2", nextReview: "2020-01-01" },
        { id: "3", nextReview: "2099-01-01" },
      ];
      expect(getDueWordsCount(vocab)).toBe(2);
    });
  });
});
