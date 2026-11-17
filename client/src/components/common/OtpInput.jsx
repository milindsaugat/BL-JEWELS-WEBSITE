import React, { useRef, useEffect } from 'react';

/**
 * Reusable Luxury Multi-Box OTP Input Component (6-Digit Segmented Boxes)
 *
 * Features:
 * - 6 individual auto-advancing digit boxes
 * - Backward navigation on Backspace
 * - ArrowLeft / ArrowRight navigation
 * - Full clipboard paste handler (splits into all boxes instantly)
 * - Number-only sanitization (inputMode="numeric")
 * - Light and Dark theme variants
 * - Auto-focus support
 *
 * @param {Object} props
 * @param {string} props.value - Full numeric string (e.g., "359682")
 * @param {function} props.onChange - Triggered with updated string
 * @param {function} [props.onComplete] - Triggered when all digits are filled
 * @param {number} [props.length=6] - Number of digit boxes (default 6)
 * @param {boolean} [props.autoFocus=true] - Focuses first empty box on mount
 * @param {boolean} [props.disabled=false] - Disables all boxes
 * @param {'light'|'dark'} [props.variant='light'] - Theme variant
 * @param {string} [props.className=''] - Custom container class
 */
export default function OtpInput({
  value = '',
  onChange,
  onComplete,
  length = 6,
  autoFocus = true,
  disabled = false,
  variant = 'light',
  className = '',
}) {
  const inputRefs = useRef([]);

  // Auto-focus the first unfilled box or the first box on mount
  useEffect(() => {
    if (!autoFocus || disabled) return;
    const digits = (value || '').split('');
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[targetIndex]?.focus();
  }, [autoFocus, disabled]);

  const digits = Array.from({ length }, (_, i) => (value || '')[i] || '');

  const handleChange = (index, e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/\D/g, '');

    // Pasting or typing multiple characters into a single box
    if (cleaned.length > 1) {
      const allDigits = cleaned.slice(0, length);
      onChange?.(allDigits);
      const nextFocus = Math.min(allDigits.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      if (allDigits.length === length) {
        onComplete?.(allDigits);
      }
      return;
    }

    // Single digit input
    const newChar = cleaned.slice(-1);
    const updated = [...digits];
    updated[index] = newChar;
    const resultString = updated.join('');
    onChange?.(resultString);

    if (newChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (resultString.length === length && !resultString.includes('')) {
      onComplete?.(resultString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Clear current box
        const updated = [...digits];
        updated[index] = '';
        onChange?.(updated.join(''));
      } else if (index > 0) {
        // Move to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const updated = [...digits];
        updated[index - 1] = '';
        onChange?.(updated.join(''));
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
      return;
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange?.(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      if (pasted.length === length) {
        onComplete?.(pasted);
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const isDark = variant === 'dark';

  return (
    <div
      role="group"
      aria-label="6-digit verification code"
      className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}
    >
      {digits.map((digit, idx) => {
        const isFilled = Boolean(digit);
        return (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            aria-label={`Digit ${idx + 1} of ${length}`}
            className={
              isDark
                ? `w-10 h-12 sm:w-11 sm:h-13 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl transition-all outline-none cursor-pointer ${
                    isFilled
                      ? 'bg-[#140505] border-2 border-[#DFBF68] text-[#FFD700] shadow-sm'
                      : 'bg-[#0E0303]/90 border-2 border-[#C9A44A]/40 text-[#FFD700] hover:border-[#DFBF68]/70 focus:border-[#DFBF68] focus:ring-4 focus:ring-[#C9A44A]/25'
                  } disabled:opacity-50 disabled:cursor-not-allowed`
                : `w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl sm:rounded-2xl transition-all outline-none cursor-pointer ${
                    isFilled
                      ? 'bg-white border-2 border-[#930303]/70 text-stone-900 shadow-xs'
                      : 'bg-stone-50 border-2 border-stone-200 text-stone-900 hover:border-stone-400 focus:border-[#930303] focus:bg-white focus:ring-4 focus:ring-[#930303]/10'
                  } disabled:opacity-50 disabled:cursor-not-allowed`
            }
          />
        );
      })}
    </div>
  );
}
