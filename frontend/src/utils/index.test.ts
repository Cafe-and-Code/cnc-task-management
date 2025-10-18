import {
  formatDate,
  formatDateTime,
  isDateInPast,
  isDateInFuture,
  truncateText,
  capitalizeFirst,
  slugify,
  isValidEmail,
  isValidPassword,
  getInitials,
  stringToColor,
  groupBy,
  uniqueBy,
  formatNumber,
  formatCurrency,
  storage,
} from './index';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format Date object correctly', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime with time', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z');
      expect(result).toMatch(/Jan 15, 2024.*2:30/);
    });

    it('should format Date object with time', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan 15, 2024.*2:30/);
    });
  });

  describe('isDateInPast', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isDateInPast(futureDate)).toBe(false);
    });

    it('should return false for current date', () => {
      const now = new Date();
      expect(isDateInPast(now)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isDateInFuture(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isDateInFuture(pastDate)).toBe(false);
    });

    it('should return false for current date', () => {
      const now = new Date();
      expect(isDateInFuture(now)).toBe(false);
    });
  });
});

describe('String Utilities', () => {
  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const result = truncateText('This is a long text', 10);
      expect(result).toBe('This is...');
    });

    it('should return original text if shorter than maxLength', () => {
      const result = truncateText('Short text', 20);
      expect(result).toBe('Short text');
    });

    it('should handle empty string', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });

    it('should handle exact length match', () => {
      const result = truncateText('Exact length', 12);
      expect(result).toBe('Exact length');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('a')).toBe('A');
    });

    it('should not change other characters', () => {
      expect(capitalizeFirst('hELLO')).toBe('HELLO');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('should handle multiple spaces and hyphens', () => {
      expect(slugify('Hello   ___   World')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('___Hello World___')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user space@domain.com')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should accept valid passwords', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('abcdefgh')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(isValidPassword('1234567')).toBe(false);
      expect(isValidPassword('short')).toBe(false);
    });

    it('should accept exactly 8 characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
    });
  });
});

describe('Color Utilities', () => {
  describe('getInitials', () => {
    it('should return initials from first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
    });

    it('should handle single character names', () => {
      expect(getInitials('A', 'B')).toBe('AB');
    });

    it('should handle empty strings', () => {
      expect(getInitials('', '')).toBe('');
    });
  });

  describe('stringToColor', () => {
    it('should generate consistent colors for same string', () => {
      const color1 = stringToColor('test');
      const color2 = stringToColor('test');
      expect(color1).toBe(color2);
    });

    it('should generate different colors for different strings', () => {
      const color1 = stringToColor('test1');
      const color2 = stringToColor('test2');
      expect(color1).not.toBe(color2);
    });

    it('should return valid HSL color format', () => {
      const color = stringToColor('test');
      expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/);
    });
  });
});

describe('Array Utilities', () => {
  describe('groupBy', () => {
    it('should group array items by key', () => {
      const items = [
        { category: 'A', name: 'Item 1' },
        { category: 'B', name: 'Item 2' },
        { category: 'A', name: 'Item 3' },
      ];
      const result = groupBy(items, item => item.category);

      expect(result).toEqual({
        A: [
          { category: 'A', name: 'Item 1' },
          { category: 'A', name: 'Item 3' },
        ],
        B: [{ category: 'B', name: 'Item 2' }],
      });
    });

    it('should handle empty array', () => {
      const result = groupBy([], item => item.id);
      expect(result).toEqual({});
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates by key', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 1, name: 'Item 1 Duplicate' },
      ];
      const result = uniqueBy(items, 'id');

      expect(result).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    it('should handle empty array', () => {
      const result = uniqueBy([], 'id');
      expect(result).toEqual([]);
    });
  });
});

describe('Number Utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with locale formatting', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-12345)).toBe('-12,345');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format currency with specified currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });
});

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('storage.get', () => {
    it('should retrieve stored item', () => {
      localStorage.setItem('test', JSON.stringify({ value: 'data' }));
      const result = storage.get('test');
      expect(result).toEqual({ value: 'data' });
    });

    it('should return default value for non-existent item', () => {
      const result = storage.get('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return null for non-existent item without default', () => {
      const result = storage.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('invalid', 'invalid-json');
      const result = storage.get('invalid', 'default');
      expect(result).toBe('default');
    });
  });

  describe('storage.set', () => {
    it('should store item as JSON', () => {
      storage.set('test', { value: 'data' });
      expect(localStorage.getItem('test')).toBe(JSON.stringify({ value: 'data' }));
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => storage.set('test', 'data')).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });

  describe('storage.remove', () => {
    it('should remove item', () => {
      localStorage.setItem('test', JSON.stringify('data'));
      storage.remove('test');
      expect(localStorage.getItem('test')).toBeNull();
    });
  });

  describe('storage.clear', () => {
    it('should clear all items', () => {
      localStorage.setItem('test1', JSON.stringify('data1'));
      localStorage.setItem('test2', JSON.stringify('data2'));
      storage.clear();
      expect(localStorage.length).toBe(0);
    });
  });
});
