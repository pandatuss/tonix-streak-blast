import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/useUserData";

interface UserHeaderProps {
  telegramId?: number;
}

export const UserHeader = ({ 
  telegramId
}: UserHeaderProps) => {
  const { userData } = useUserData(telegramId);
  
  const username = userData?.username ? `@${userData.username}` : "@tonixuser";
  const firstName = userData?.firstName || "Tonix";
  const lastName = userData?.lastName || "User";
  const avatarUrl = userData?.profilePhotoUrl;
  
  const displayName = `${firstName}${lastName ? ` ${lastName}` : ''}`;
  const initials = `${firstName?.[0] || 'T'}${lastName?.[0] || 'U'}`;

  return (
    <div className="flex items-center gap-4 p-6 animate-slide-up">
      <Avatar className="h-16 w-16 border-2 border-primary/20">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <p className="text-primary text-lg font-semibold mb-1">
          {firstName}
        </p>
        <p className="text-foreground/80 text-base">
          {username}
        </p>
      </div>
    </div>
  );
};