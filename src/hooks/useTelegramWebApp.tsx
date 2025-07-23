import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          auth_date: number;
          hash: string;
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export const useTelegramWebApp = () => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveUserToDatabase = async (user: TelegramUser, referralCode?: string) => {
    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('telegram_id')
        .eq('telegram_id', user.id)
        .single();

      const isNewUser = !existingUser;

      // Upsert user data
      const { error } = await supabase
        .from('users')
        .upsert({
          telegram_id: user.id,
          username: user.username || null,
          first_name: user.first_name,
          last_name: user.last_name || null,
          profile_photo_url: user.photo_url || null,
          total_tonix: 0,
          referral_code: user.id.toString()
        }, {
          onConflict: 'telegram_id'
        });

      if (error) {
        console.error('Error saving user to database:', error);
        setError('Failed to save user data');
        return;
      }

      // Process referral code if this is a new user and referral code exists
      if (isNewUser && referralCode) {
        try {
          await supabase.rpc('process_referral_signup', {
            new_user_telegram_id: user.id,
            referrer_code: referralCode
          });
        } catch (referralError) {
          console.error('Error processing referral:', referralError);
          // Don't fail the main signup if referral processing fails
        }
      }
    } catch (err) {
      console.error('Database error:', err);
      setError('Database connection failed');
    }
  };

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Load Telegram Web App script
        if (!window.Telegram?.WebApp) {
          const script = document.createElement('script');
          script.src = 'https://telegram.org/js/telegram-web-app.js';
          script.async = true;
          
          script.onload = () => {
            if (window.Telegram?.WebApp) {
              window.Telegram.WebApp.ready();
              window.Telegram.WebApp.expand();
              
              const user = window.Telegram.WebApp.initDataUnsafe.user;
              const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
              
              if (user) {
                setTelegramUser(user);
                saveUserToDatabase(user, startParam);
              } else {
                // Fallback for development/testing
                const mockUser: TelegramUser = {
                  id: 123456789,
                  first_name: 'Tonix',
                  last_name: 'User',
                  username: 'tonixuser',
                  is_premium: false
                };
                setTelegramUser(mockUser);
                saveUserToDatabase(mockUser);
              }
            }
            setIsLoading(false);
          };

          script.onerror = () => {
            console.error('Failed to load Telegram Web App script');
            setError('Failed to load Telegram SDK');
            setIsLoading(false);
          };

          document.head.appendChild(script);
        } else {
          // Script already loaded
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          
          const user = window.Telegram.WebApp.initDataUnsafe.user;
          const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
          
          if (user) {
            setTelegramUser(user);
            await saveUserToDatabase(user, startParam);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Telegram initialization error:', err);
        setError('Telegram initialization failed');
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  return {
    telegramUser,
    isLoading,
    error,
    webApp: window.Telegram?.WebApp
  };
};