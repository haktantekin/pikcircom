import { TextInput } from '@mantine/core';
import { IconWritingSign } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from "react-i18next";

interface NewCollectionModalProps {
  onCreate?: (name: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function NewCollectionModal({ onCreate, isSubmitting = false }: NewCollectionModalProps) {
  const [name, setName] = useState('');
  const { t } = useTranslation();

  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName || isSubmitting) {
      return;
    }

    await onCreate?.(trimmedName);
    setName('');
  };

  return (
    <>
      <div>
        <TextInput
          icon={<IconWritingSign size={15} />}
          type="text"
          label={t("giveNameCollection")}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)} />
      </div>
      <div>
        <button
          onClick={handleCreate}
          className={`w-full h-full flex text-center justify-center items-center rounded font-bold text-white text-sm mt-4 max-h-[40px] max-w-[120px] mx-auto min-h-[40px] ${name.trim() ? 'bg-58b4d1' : 'bg-f5f3f4 text-gray-400 pointer-events-none'}`}
          disabled={!name.trim() || isSubmitting}>
          {isSubmitting ? '...' : t("create")}
        </button>
      </div>
    </>
  )
}
