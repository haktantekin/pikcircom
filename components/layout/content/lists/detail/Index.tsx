import { IconArrowNarrowLeft } from "@tabler/icons-react";
import { Tabs } from '@mantine/core';
import ListDetailItem from "./ListDetailItem";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function ListDetail() {
  const { t } = useTranslation();
  return (
    
    <>
      <div className="col-span-12 lg:col-span-7 relative mb-4 mt-4 lg:mt-0">
        <Tabs defaultValue="today">
          <div className='w-full bg-white rounded mb-4 text-sm text-center min-h-[40px] relative grid grid-cols-12 justify-items-center items-center' style={{ boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px" }}>
            <button className="col-span-1" onClick={() => history.back()}><IconArrowNarrowLeft /></button>
            <div className="col-span-7">
              <span className="font-bold text-sm text-126782">Maaş Yatmıştır</span>&nbsp; {t("list")}
            </div>
            <div className="ml-auto col-span-4 pr-2">
              <Tabs.List className='w-full justify-around border-b-0 tab-active'>
                <Tabs.Tab value="today">{t("today")}</Tabs.Tab>
                <Tabs.Tab value="yesterday">{t("yesterday")}</Tabs.Tab>
                <Tabs.Tab value="all">{t("all")}</Tabs.Tab>
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
