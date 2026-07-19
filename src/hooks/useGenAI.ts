import { useState, useCallback } from 'react';

type GenAIFunction<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

export function useGenAI<TArgs extends any[], TResult>(
  aiFunction: GenAIFunction<TArgs, TResult>
) {
  const [data, setData] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: TArgs) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiFunction(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI generation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [aiFunction]);

  return { data, isLoading, error, execute, setData };
}
