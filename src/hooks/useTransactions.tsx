import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  telegram_id: number;
  amount: number;
  transaction_type: 'task_completion' | 'referral_bonus' | 'referral_commission';
  source_id?: string;
  description?: string;
  created_at: string;
}

export const useTransactions = (telegramId?: number) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('telegram_id', telegramId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions((data as Transaction[]) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    if (!telegramId) return;

    // Subscribe to real-time updates for new transactions
    const subscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `telegram_id=eq.${telegramId}`
        },
        (payload) => {
          setTransactions(prev => [payload.new as Transaction, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [telegramId]);

  // Listen for task completion events to refresh transactions
  useEffect(() => {
    const handleUserDataRefresh = () => {
      fetchTransactions();
    };

    window.addEventListener('userDataRefresh', handleUserDataRefresh);
    return () => {
      window.removeEventListener('userDataRefresh', handleUserDataRefresh);
    };
  }, [telegramId]);

  const getTransactionsByType = (type: string) => {
    return transactions.filter(t => t.transaction_type === type);
  };

  const getTotalEarnings = () => {
    return transactions.reduce((total, t) => total + t.amount, 0);
  };

  const getTodaysEarnings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return transactions
      .filter(t => new Date(t.created_at) >= today)
      .reduce((total, t) => total + t.amount, 0);
  };

  return {
    transactions,
    loading,
    getTransactionsByType,
    getTotalEarnings,
    getTodaysEarnings
  };
};