import { IconRosetteFilled, IconShieldCheckFilled, IconAdFilled } from "@tabler/icons-react";
import { Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface UserBadgeProps {
  badge?: string;
  size?: number;
}

const badgeConfig: Record<string, { icon: typeof IconAdFilled; color: string; translationKey: string }> = {
  creator: { icon: IconRosetteFilled, color: "text-purple-500", translationKey: "badgeCreator" },
  verified: { icon: IconShieldCheckFilled, color: "text-58b4d1", translationKey: "badgeVerified" },
  admin: { icon: IconAdFilled, color: "text-202124", translationKey: "badgeAdmin" },
};

export default function UserBadge({ badge, size = 15 }: UserBadgeProps) {
  const { t } = useTranslation();

  if (!badge || !(badge in badgeConfig)) {
    return null;
  }

  const config = badgeConfig[badge];
  const Icon = config.icon;

  return (
    <Tooltip label={t(config.translationKey)}>
      <Icon size={size} className={config.color} />
    </Tooltip>
  );
}
