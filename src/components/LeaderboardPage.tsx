import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  telegram_id: number;
  username?: string;
  first_name?: string;
  profile_photo_url?: string;
  total_balance: number;
  rank: number;
}

const getRewardForRank = (rank: number): string => {
  if (rank === 1) return "$1,000";
  if (rank === 2) return "$750";
  if (rank === 3) return "$500";
  if (rank >= 4 && rank <= 5) return "$300";
  if (rank >= 6 && rank <= 10) return "$200";
  if (rank >= 11 && rank <= 20) return "$100";
  if (rank >= 21 && rank <= 50) return "$75";
  if (rank >= 51 && rank <= 100) return "$30";
  return "";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
  return <Trophy className="w-5 h-5 text-muted-foreground" />;
};

const getPodiumStyle = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30";
  if (rank === 3) return "bg-gradient-to-br from-amber-600/20 to-amber-700/10 border-amber-600/30";
  return "bg-card/50";
};

export const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get all users with their transaction sums to calculate total balance
      const { data: usersWithBalances, error } = await supabase.rpc(
        'get_leaderboard_data'
      );

      if (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback: fetch users and calculate balances manually
        await fetchLeaderboardFallback();
        return;
      }

      if (usersWithBalances) {
        const sortedUsers = usersWithBalances
          .sort((a, b) => b.total_balance - a.total_balance)
          .slice(0, 100)
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }));

        setLeaderboardData(sortedUsers);
      }
    } catch (error) {
      console.error('Error in fetchLeaderboard:', error);
      await fetchLeaderboardFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardFallback = async () => {
    try {
      // Fetch all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('telegram_id, username, first_name, profile_photo_url');

      if (usersError) throw usersError;

      // Fetch all transactions and group by telegram_id
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('telegram_id, amount');

      if (transError) throw transError;

      // Calculate balances
      const balanceMap = new Map<number, number>();
      transactions?.forEach(transaction => {
        const current = balanceMap.get(transaction.telegram_id) || 0;
        balanceMap.set(transaction.telegram_id, current + transaction.amount);
      });

      // Combine data and sort
      const usersWithBalances = users?.map(user => ({
        ...user,
        total_balance: balanceMap.get(user.telegram_id) || 0
      })) || [];

      const sortedUsers = usersWithBalances
        .sort((a, b) => b.total_balance - a.total_balance)
        .slice(0, 100)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setLeaderboardData(sortedUsers);
    } catch (error) {
      console.error('Error in fallback fetch:', error);
    }
  };

  if (loading) {
    return (
      <div className="pb-24 px-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-6 py-6 text-center">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-primary" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">Top 100 Tonix Earners</p>
      </div>

      {/* Podium - Top 3 */}
      {topThree.length > 0 && (
        <div className="px-6 mb-8">
          <Card className="p-6 bg-gradient-card/80 backdrop-blur-sm border-border/20">
            <h2 className="text-lg font-semibold text-center mb-6 text-foreground">🏆 Champions Podium</h2>
            
            <div className="flex justify-center items-end gap-4">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="text-center">
                  <div className="relative">
                    <Avatar className="w-16 h-16 mx-auto ring-4 ring-gray-400/50 shadow-lg">
                      <AvatarImage src={topThree[1].profile_photo_url || undefined} />
                      <AvatarFallback className="bg-gray-400/20 text-gray-400 font-bold text-lg">
                        {topThree[1].first_name?.[0] || topThree[1].username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold text-sm text-foreground truncate max-w-[80px]">
                      {topThree[1].first_name || topThree[1].username || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">{topThree[1].total_balance.toLocaleString()} TONIX</p>
                    <Badge variant="secondary" className="mt-1 text-xs bg-gray-400/20 text-gray-400">
                      🥈 $750
                    </Badge>
                  </div>
                  <div className="w-16 h-20 bg-gradient-to-t from-gray-400/20 to-gray-400/10 rounded-t-lg mt-2"></div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="text-center">
                  <div className="relative">
                    <Avatar className="w-20 h-20 mx-auto ring-4 ring-yellow-500/50 shadow-xl">
                      <AvatarImage src={topThree[0].profile_photo_url || undefined} />
                      <AvatarFallback className="bg-yellow-500/20 text-yellow-500 font-bold text-xl">
                        {topThree[0].first_name?.[0] || topThree[0].username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-3 -right-3">
                      <Crown className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-foreground truncate max-w-[90px]">
                      {topThree[0].first_name || topThree[0].username || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground">{topThree[0].total_balance.toLocaleString()} TONIX</p>
                    <Badge className="mt-1 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      🏆 $1,000
                    </Badge>
                  </div>
                  <div className="w-20 h-24 bg-gradient-to-t from-yellow-500/20 to-yellow-500/10 rounded-t-lg mt-2"></div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="text-center">
                  <div className="relative">
                    <Avatar className="w-16 h-16 mx-auto ring-4 ring-amber-600/50 shadow-lg">
                      <AvatarImage src={topThree[2].profile_photo_url || undefined} />
                      <AvatarFallback className="bg-amber-600/20 text-amber-600 font-bold text-lg">
                        {topThree[2].first_name?.[0] || topThree[2].username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Award className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold text-sm text-foreground truncate max-w-[80px]">
                      {topThree[2].first_name || topThree[2].username || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">{topThree[2].total_balance.toLocaleString()} TONIX</p>
                    <Badge variant="secondary" className="mt-1 text-xs bg-amber-600/20 text-amber-600">
                      🥉 $500
                    </Badge>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-t from-amber-600/20 to-amber-600/10 rounded-t-lg mt-2"></div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Remaining Rankings */}
      <div className="px-6 space-y-3">
        {remaining.map((user) => {
          const reward = getRewardForRank(user.rank);
          return (
            <Card 
              key={user.telegram_id} 
              className={`p-4 ${getPodiumStyle(user.rank)} border transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/20">
                  <span className="font-bold text-foreground">#{user.rank}</span>
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.profile_photo_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                    {user.first_name?.[0] || user.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {user.first_name || user.username || "User"}
                    </h3>
                    {user.rank <= 10 && getRankIcon(user.rank)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.total_balance.toLocaleString()} TONIX
                  </p>
                  {reward && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      💰 {reward}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {leaderboardData.length === 0 && (
        <div className="text-center py-12 px-6">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Rankings Yet</h3>
          <p className="text-muted-foreground">
            Start earning Tonix to appear on the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
};