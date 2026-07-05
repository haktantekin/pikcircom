
import { Modal, TextInput } from '@mantine/core';
import { IconTrashFilled, IconAbc, IconSettings, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from "react-i18next";

interface CollectionSettingsProps {
  name: string;
  visibility?: string;
  onUpdate?: (updates: { name?: string; visibility?: string }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export default function CollectionSettings({ name, visibility = 'public', onUpdate, onDelete }: CollectionSettingsProps) {
  const [collectionSettingsModal, setCollectionSettingsModal] = useState(false);
  const [collectionName, setCollectionName] = useState(name);
  const [collectionVisibility, setCollectionVisibility] = useState(visibility);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleUpdate = async () => {
    const trimmedName = collectionName.trim();

    if (!trimmedName || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate?.({ name: trimmedName, visibility: collectionVisibility });
      setCollectionSettingsModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDelete?.();
      setCollectionSettingsModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button className="text-202124 rounded text-sm font-bold justify-center items-center" title={t("edit")} onClick={() => setCollectionSettingsModal(true)}>
        <IconSettings size={16} />
      </button>
      <Modal opened={collectionSettingsModal} onClose={() => setCollectionSettingsModal(false)} centered title={t("editCollection")}>
        <div className="mt-2">
          <TextInput
            icon={<IconAbc size={15} />}
            type="text"
            label={t("collectionName")}
            value={collectionName}
            onChange={(event) => setCollectionName(event.currentTarget.value)}
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">{t("collectionVisibility")}</label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setCollectionVisibility('public')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-bold transition-colors ${collectionVisibility === 'public' ? 'bg-58b4d1 text-white' : 'border border-gray-300 text-gray-600'}`}
            >
              <IconEye size={16} />
              {t("collectionPublic")}
            </button>
            <button
              type="button"
              onClick={() => setCollectionVisibility('private')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-bold transition-colors ${collectionVisibility === 'private' ? 'bg-58b4d1 text-white' : 'border border-gray-300 text-gray-600'}`}
            >
              <IconEyeOff size={16} />
              {t("collectionPrivate")}
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-center items-center w-full gap-3">
          <div className='w-full'>
            <button onClick={handleDelete} className="w-full h-full flex text-center justify-center items-center rounded font-bold text-202124 text-sm max-w-[120px] mx-auto min-h-[36px] gap-2 disabled:opacity-60" disabled={isSubmitting}><IconTrashFilled size={15} />
            {t("deleteFull")}
            </button>
          </div>
          <div className='w-full'>
            <button onClick={handleUpdate} className="w-full h-full flex text-center justify-center items-center rounded font-bold text-white text-sm max-w-[120px] mx-auto min-h-[36px] bg-58b4d1 disabled:opacity-60" disabled={!collectionName.trim() || isSubmitting}>
            {isSubmitting ? '...' : t("update")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
