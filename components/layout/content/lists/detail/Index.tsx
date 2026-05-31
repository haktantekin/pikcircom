import type { CSSProperties } from "react";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import { Tabs } from '@mantine/core';
import ListDetailItem from "./ListDetailItem";
import { useTranslation } from "react-i18next";

export default function ListDetail() {
  const { t } = useTranslation();
  return (
    
    <>
      <div className="col-span-12 lg:col-span-10 relative mb-4 mt-4 lg:mt-0">
        <Tabs
          defaultValue="today"
          styles={
            {
              tab: {
                border: "none",
                borderBottom: "none",
                fontWeight: 500,
              },
              list: {
                border: "none",
                gap: 4,
                backgroundColor: "transparent",
              },
            } as Record<string, CSSProperties>
          }
        >
          <div className='relative mb-4 grid min-h-[40px] w-full grid-cols-12 items-center justify-items-center rounded-xl border border-gray-100 bg-white px-2 py-2 text-center text-sm shadow-card sm:px-3'>
            <button className="col-span-1" onClick={() => history.back()}><IconArrowNarrowLeft /></button>
            <div className="col-span-7">
              <span className="font-bold text-sm text-126782">Maaş Yatmıştır</span>&nbsp; {t("list")}
            </div>
            <div className="col-span-4 ml-auto w-full max-w-full pr-1 sm:pr-2">
              <Tabs.List className="hide-scrollbar flex w-full flex-nowrap justify-stretch gap-1 overflow-x-auto rounded-xl bg-gray-100/75 p-1">
                <Tabs.Tab
                  value="today"
                  className="min-w-0 flex-1 rounded-lg border-0 px-2 py-1.5 text-center text-[11px] font-medium text-gray-600 transition-colors hover:bg-white/60 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:text-xs"
                >
                  {t("today")}
                </Tabs.Tab>
                <Tabs.Tab
                  value="yesterday"
                  className="min-w-0 flex-1 rounded-lg border-0 px-2 py-1.5 text-center text-[11px] font-medium text-gray-600 transition-colors hover:bg-white/60 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:text-xs"
                >
                  {t("yesterday")}
                </Tabs.Tab>
                <Tabs.Tab
                  value="all"
                  className="min-w-0 flex-1 rounded-lg border-0 px-2 py-1.5 text-center text-[11px] font-medium text-gray-600 transition-colors hover:bg-white/60 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:text-xs"
                >
                  {t("all")}
                </Tabs.Tab>
              </Tabs.List>
            </div>
          </div>
          <div>
            <Tabs.Panel value="today" pt="xs">
              <section className="w-full grid grid-cols-2 gap-5 bg-white p-4 rounded">
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/Dp-lEfsW4AEDQXc.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/Dp-lP3mWkAAinKk.jpg`}
                  user={'@can'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
              </section>
            </Tabs.Panel>
            <Tabs.Panel value="yesterday" pt="xs">
              <section className="w-full grid grid-cols-2 gap-5 bg-white p-4 rounded">
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/Dp-lEfsW4AEDQXc.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/Dp-lP3mWkAAinKk.jpg`}
                  user={'@can'}
                  time={"2023-05-21T10:11:00"}
                />
              </section>
            </Tabs.Panel>
            <Tabs.Panel value="all" pt="xs">
              <section className="w-full grid grid-cols-2 gap-5 bg-white p-4 rounded">
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/Dp-lEfsW4AEDQXc.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/Dp-lP3mWkAAinKk.jpg`}
                  user={'@can'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/DrGjfB2XQAIELri.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
                <ListDetailItem
                  link={`/post`}
                  image={`/postExample/F5Z00CEaEAAFPgi.jpg`}
                  user={'@natkah'}
                  time={"2023-05-21T10:11:00"}
                />
              </section>
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>
    </>
  )
}
