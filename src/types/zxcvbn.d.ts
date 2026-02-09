declare module 'zxcvbn' {
  interface ZxcvbnFeedback {
    warning?: string;
    suggestions?: string[];
  }

  interface ZxcvbnResult {
    score: number;
    guesses: number;
    guesses_log10: number;
    sequence: unknown[];
    calc_time: number;
    feedback: ZxcvbnFeedback;
  }

  function zxcvbn(password: string, userInputs?: string[]): ZxcvbnResult;

  export default zxcvbn;
}
