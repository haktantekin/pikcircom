import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Drawer, Menu, Tooltip } from "@mantine/core";
import { IconChecks } from "@tabler/icons-react";

import NotificationBellTarget from "@/components/main/header/notifications/NotificationBellTarget";
import NotificationDrawerRow from "@/components/main/header/notifications/NotificationDrawerRow";
import NotificationEntry from "@/components/main/header/notifications/NotificationEntry";
import { useNotifications } from "@/components/main/header/notifications/NotificationProvider";
import { buildNotificationSummary } from "@/components/main/header/notifications/notificationsSummary";

interface NotificationProps {
  /** Tek DOM id için: sol menüden `show-notification` ile tetiklendiğinde masaüstü header örneği. */
  notificationAnchor?: boolean;
  compact?: boolean;
}

export default function Notification({ notificationAnchor = false, compact = false }: NotificationProps) {
  const { t, i18n } = useTranslation();
  const locale = typeof i18n.language === "string" ? i18n.language : "tr";

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const {
    items,
    unreadCount,
    busy,
    unauthorized,
    fetchError,
    previewItems,
    loadDrawerQuiet,
    handleHoverMarkRead,
    handleMarkAllRead,
    selectNotificationItem,
  } = useNotifications();

  useEffect(() => {
    if (drawerOpened) {
      loadDrawerQuiet();
    }
  }, [drawerOpened, loadDrawerQuiet]);

  const previewSummaries = useMemo(
    () =>
      previewItems.map((row) => ({
        row,
        summary: buildNotificationSummary(row, t),
      })),
    [previewItems, t],
  );

  const drawerSummaries = useMemo(
    () =>
      items.map((row) => ({
        row,
        summary: buildNotificationSummary(row, t),
      })),
    [items, t],
  );

  const drawerTitle =
    unauthorized || unreadCount <= 0 ? (
      <span>{t("myNotifications")}</span>
    ) : (
      <div className="flex items-center justify-between gap-3 pr-2">
        <span className="min-w-0 flex-1 truncate font-bold">{t("myNotifications")}</span>
        <Tooltip label={t("notificationsMarkAllRead")}>
          <ActionIcon
            type="button"
            variant="subtle"
            color="dimmed"
            size="lg"
            radius="xl"
            aria-label={String(t("notificationsMarkAllRead"))}
            title={String(t("notificationsMarkAllRead"))}
            className="shrink-0 text-126782 hover:text-58b4d1"
            onClick={() => {
              void handleMarkAllRead();
            }}
          >
            <IconChecks size={20} stroke={1.25} />
          </ActionIcon>
        </Tooltip>
      </div>
    );

  return (
    <>
      <Menu
        shadow="md"
        width={340}
        withArrow
        closeOnItemClick
        withinPortal
        zIndex={400}
      >
        <Menu.Target>
          <NotificationBellTarget
            notificationAnchor={notificationAnchor}
            unreadCount={unreadCount}
            compact={compact}
          />
        </Menu.Target>
        <Menu.Dropdown>
          {busy && previewItems.length === 0 && !unauthorized ? (
            <Menu.Item disabled className="text-center text-xs text-gray-500">
              {t("profileOverviewLoading")}
            </Menu.Item>
          ) : null}

          {unauthorized ? (
            <Menu.Item disabled className="text-xs text-gray-600">
              {t("notificationsLoginHint")}
            </Menu.Item>
          ) : null}

          {!unauthorized && fetchError ? (
            <Menu.Item disabled className="text-xs text-red-600">
              {t("notificationsFailed")}
            </Menu.Item>
          ) : null}

          {!unauthorized && !fetchError && !busy && previewItems.length === 0 ? (
            <Menu.Item disabled className="text-xs text-gray-600">
              {t("notificationsEmpty")}
            </Menu.Item>
          ) : null}

          {previewSummaries.map(({ row, summary }) => (
            <NotificationEntry
              key={row.id}
              notification={row}
              locale={locale}
              summary={summary}
              compact
              onNavigate={() => void selectNotificationItem(row, closeDrawer)}
              onHoverRead={handleHoverMarkRead}
            />
          ))}

          <Menu.Item id="show-all" className="text-center font-bold" onClick={openDrawer}>
            {t("showAll")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={drawerTitle}
        position="right"
        size="xl"
        className="drawer-notification"
      >
        {unauthorized ? (
          <p className="text-sm text-gray-600">{t("notificationsLoginHint")}</p>
        ) : null}
        {!unauthorized && fetchError ? (
          <p className="text-sm text-red-600">{t("notificationsFailed")}</p>
        ) : null}
        {!unauthorized && !fetchError && items.length === 0 && !busy ? (
          <p className="text-sm text-gray-600">{t("notificationsEmpty")}</p>
        ) : null}
        <div>
          {!unauthorized && !fetchError
            ? drawerSummaries.map(({ row, summary }) => (
                <NotificationDrawerRow
                  key={`drawer-${row.id}`}
                  notification={row}
                  locale={locale}
                  summary={summary}
                  onNavigate={() => void selectNotificationItem(row, closeDrawer)}
                  onHoverRead={handleHoverMarkRead}
                />
              ))
            : null}
        </div>
      </Drawer>
    </>
  );
}
